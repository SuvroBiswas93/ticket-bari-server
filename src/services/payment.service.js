import Stripe from 'stripe';
import bookingRepository from '../repositories/booking.repository.js';
import transactionRepository from '../repositories/transaction.repository.js';
import userRepository from '../repositories/user.repository.js';
import moment from 'moment';
import  {env} from "../config/env.js";


class PaymentService {
  constructor() {
    this.stripe = new Stripe(env.stripeSecretKey);
  }

  async createCheckoutSession(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId.toString()) {
      throw new Error('Not authorized to pay for this booking');
    }

    if (booking.status !== 'accepted') {
      throw new Error('Booking must be accepted before payment');
    }

    if (booking.paymentStatus === 'paid') {
      throw new Error('Booking already paid');
    }

    const departureDateTime = new Date(booking.departureTime);
    if (departureDateTime < new Date()) {
      throw new Error('Cannot pay for past departure');
    }

    const user = await userRepository.findById(booking.userId);
    if (!user) {
      throw new Error('User not found');
    }
    
    const vendor = await userRepository.findById(booking.vendorId);
    if (!vendor) {
      throw new Error('Vendor not found');
    }
   
    if (vendor.isFraud) { 
      throw new Error('Vendor is fraud');
    }
    
    const amount = Math.round(Number(booking.ticketPrice) * 100);

    // 4 Create Stripe session
    const session = await this.stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'bdt',
            unit_amount: amount,
            product_data: {
              name: `Ticket: ${booking.ticketTitle}`,
            },
          },
          quantity: Number(booking.bookingQuantity),
        },
      ],
      mode: 'payment',
      metadata: {
        userId: booking.userId,
        bookingId: bookingId,
        ticketId: booking.ticketId,
        ticketTitle: booking.ticketTitle,
      },
      customer_email: user.email,
      success_url: `${env.clientUrl}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${env.clientUrl}/payment/cancel`,
    });

    return session;
  }
  async getUserTransactions(userId) {
    return await transactionRepository.findUserTransactions(userId);
  }

  async getTransactionById(transactionId) {
    return await transactionRepository.findById(transactionId);
  }
  async handleWebhook(req) {
    const sig = req.headers['stripe-signature'];
    let event;

    try {
      event = this.stripe.webhooks.constructEvent(
        req.body,
        sig,
        env.stripeWebhookSecret
      );
    } catch (err) {
      console.error(`Webhook Error: ${err.message}`);
      throw new Error(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        throw new Error(`Unhandled event type ${event.type}`);
    }

    return {received: true};
  }
  async handleCheckoutSessionCompleted(session) {
    return await this.processPayment(session.metadata.bookingId.toString(), session.id);
  }
  async processPayment(bookingId, paymentId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    const updatedBooking = await bookingRepository.updatePaymentStatus(
      bookingId, 
      'paid', 
      paymentId
    );

    await transactionRepository.create({
      userId: booking.userId,
      bookingId: bookingId,
      ticketId: booking.ticketId,
      ticketTitle: booking.ticketTitle,
      amount: booking.totalPrice,
      currency: 'BDT',
      paymentMethod: 'stripe',
      transactionId: paymentId,
      status: 'success'
    });

    return updatedBooking;
  }
}

export default new PaymentService();