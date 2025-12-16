import bookingRepository from '../repositories/booking.repository.js';
import ticketRepository from '../repositories/ticket.repository.js';
import userRepository from '../repositories/user.repository.js';
import moment from 'moment';
import transactionRepository from '../repositories/transaction.repository.js';

class BookingService {
  async createBooking(ticketId, userId, bookingQuantity) {
    const ticket = await ticketRepository.findById(ticketId);
    if (!ticket || !ticket.isActive) {
      throw new Error('Ticket not found');
    }

    if (ticket.verificationStatus !== 'approved') {
      throw new Error('Ticket is not approved for booking');
    }

    const departureDateTime = moment(ticket.departureTime);
    if (departureDateTime.isBefore(moment())) {
      throw new Error('Cannot book past departure');
    }

    if (ticket.availableQuantity < bookingQuantity) {
      throw new Error('Not enough tickets available');
    }

    const user = await userRepository.findById(userId);
    if (!user || !user.isActive) {
      throw new Error('User not found');
    }

    const totalPrice = ticket.price * bookingQuantity;

    const booking = await bookingRepository.create({
      ticketId: ticketId.toString(),
      userId: userId.toString(),
      userName: user.name,
      userEmail: user.email,
      bookingQuantity,
      totalPrice,
      departureTime: ticket.departureTime,
      vendorId: ticket.vendorId,
      ticketTitle: ticket.title,
      ticketPrice: ticket.price,
      transportType: ticket.transportType,
      from: ticket.from,
      to: ticket.to
    });

    await ticketRepository.reduceAvailableQuantity(ticketId, bookingQuantity);

    return booking;
  }

  async getUserBookings(userId) {
    const bookings = await bookingRepository.findUserBookings(userId);

    const bookingsWithCountdown = bookings.map(booking => {
      const departureDateTime = moment(booking.departureTime);
      const now = moment();
      const diff = departureDateTime.diff(now);
      
      return {
        ...booking,
        countdown: diff > 0 ? diff : 0
      };
    });

    return bookingsWithCountdown;
  }

  async getVendorBookings(vendorId) {
    return await bookingRepository.findVendorBookings(vendorId);
  }

  async getPendingBookings(vendorId = null) {
    return await bookingRepository.findPendingBookings(vendorId);
  }

  async updateBookingStatus(bookingId, status, vendorId = null) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (vendorId && booking.vendorId !== vendorId.toString()) {
      throw new Error('Not authorized to update this booking');
    }


    if (booking.status !== 'pending') {
      throw new Error('Booking status cannot be changed');
    }

    if (status === 'rejected') {
      await ticketRepository.increaseAvailableQuantity(
        booking.ticketId, 
        booking.bookingQuantity
      );
    }

    return await bookingRepository.updateBookingStatus(bookingId, status);
  }

  async processPayment(bookingId, paymentId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId.toString()) {
      throw new Error('Not authorized to process payment for this booking');
    }


    if (booking.status !== 'accepted') {
      throw new Error('Booking must be accepted before payment');
    }

    const departureDateTime = moment(booking.departureTime);
    if (departureDateTime.isBefore(moment())) {
      throw new Error('Cannot pay for past departure');
    }


    const updatedBooking = await bookingRepository.updatePaymentStatus(
      bookingId, 
      'paid', 
      paymentId
    );

    await transactionRepository.create({
      userId: booking.userId,
      bookingId: bookingId.toString(),
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

  async cancelBooking(bookingId, userId) {
    const booking = await bookingRepository.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.userId !== userId.toString()) {
      throw new Error('Not authorized to cancel this booking');
    }

    if (booking.status !== 'pending') {
      throw new Error('Only pending bookings can be cancelled');
    }

    await ticketRepository.increaseAvailableQuantity(
      booking.ticketId, 
      booking.bookingQuantity
    );

    await bookingRepository.delete(bookingId);

    return true;
  }

  async getBookingStatistics(userId = null, vendorId = null) {
    return await bookingRepository.getBookingStatistics(userId, vendorId);
  }

  async getRevenueByVendor(vendorId) {
    return await bookingRepository.getRevenueByVendor(vendorId);
  }
}

export default new BookingService();