const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const admin = require('firebase-admin');
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const crypto = require('crypto');

const app = express();
const port = 3000;

/* UTIL  */
function generatebookingId() {
  const prefix = 'BK';
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = crypto.randomBytes(3).toString('hex').toUpperCase();
  return `${prefix}-${date}-${random}`;
}

/*  MIDDLEWARE  */
app.use(cors());
app.use(express.json());

const verifyFBToken = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) return res.status(401).send({ message: 'Unauthorized access' });

  try {
    const idToken = token.split(' ')[1];
    const decoded = await admin.auth().verifyIdToken(idToken);
    req.decoded_email = decoded.email;
    next();
  } catch (error) {
    return res.status(401).send({ message: 'Unauthorized access' });
  }
};

/* ====================== DATABASE ====================== */
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const db = client.db('ticketBari-db');
    const usersCollection = db.collection('users');
    const ticketsCollection = db.collection('tickets');
    const bookingsCollection = db.collection('bookings');
    const paymentCollection = db.collection('payments');

    /* =====================================================
       PAYMENT CHECKOUT (BLOCK UNACCEPTED & FRAUD BOOKINGS)
    ====================================================== */
    app.post('/payment-checkout-session', async (req, res) => {
      try {
        const { bookingId, ticketTitle, totalPrice, userEmail, ticketId } =
          req.body;

        // 1 Fetch booking
        const booking = await bookingsCollection.findOne({
          _id: new ObjectId(bookingId),
        });

        if (!booking) {
          return res.status(404).send({ message: 'Booking not found' });
        }

        // 2 Prevent payment unless accepted
        if (booking.status !== 'accepted') {
          return res.status(403).send({
            message: 'Payment not allowed. Booking not accepted.',
          });
        }

        // 3 Fraud vendor check
        const vendor = await usersCollection.findOne({
          email: booking.vendorEmail,
        });

        if (vendor?.isFraud === true) {
          return res.status(403).send({
            message: 'Payment blocked. Vendor marked as fraud.',
          });
        }

        const amount = parseInt(totalPrice) * 100;

        // 4 Create Stripe session
        const session = await stripe.checkout.sessions.create({
          line_items: [
            {
              price_data: {
                currency: 'usd',
                unit_amount: amount,
                product_data: {
                  name: `Ticket: ${ticketTitle}`,
                },
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          metadata: {
            bookingId,
            ticketId,
            ticketTitle,
            userEmail,
          },
          customer_email: userEmail,
          success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
        });

        res.send({ url: session.url });
      } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Failed to create payment session' });
      }
    });

    /* =====================================================
       PAYMENT SUCCESS (SAFE & DOUBLE PROTECTED)
    ====================================================== */
    app.patch('/payment-success', async (req, res) => {
      try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);
            console.log('session retrieved',session)
        if (session.payment_status !== 'paid') {
          return res.send({
            success: false,
            message: 'Payment not completed',
          });
        }

        const bookingId = session.metadata.bookingId;
        const ticketId = session.metadata.ticketId;
        const bookedId = generatebookingId();

        // 1 Fetch booking again (security)
        const booking = await bookingsCollection.findOne({
          _id: new ObjectId(bookingId),
        });

        if (!booking) {
          return res.status(404).send({ message: 'Booking not found' });
        }

        // 2 Prevent double payment
        if (booking.status === 'paid') {
          return res.send({
            success: true,
            message: 'Booking already paid',
          });
        }

        // 3 Only accepted bookings allowed
        if (booking.status !== 'accepted') {
          return res.status(403).send({
            success: false,
            message: 'Invalid booking status',
          });
        }

        // 4 Update booking status
        const bookingUpdate = await bookingsCollection.updateOne(
          { _id: new ObjectId(bookingId) },
          { $set: { status: 'paid', bookedId } }
        );

        // 5 Reduce ticket quantity
        await ticketsCollection.updateOne(
          { _id: new ObjectId(ticketId) },
          { $inc: { quantity: -booking.quantity } }
        );

        // 6 Save transaction
        const transaction = {
          transactionId: session.payment_intent,
          bookingId,
          ticketId,
          ticketTitle: session.metadata.ticketTitle,
          amount: session.amount_total / 100,
          currency: session.currency,
          userEmail: session.customer_email,
          paidAt: new Date(),
        };

        const transactionResult =
          await paymentCollection.insertOne(transaction);

        res.send({
          success: true,
          bookingModified: bookingUpdate,
          trackingId: bookedId,
          transactionId: session.payment_intent,
          transactionInfo: transactionResult,
        });
      } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Server error' });
      }
    });

    // Ping DB
    await client.db('admin').command({ ping: 1 });
    console.log('MongoDB connected successfully');
  } finally {
    // keep client open
  }
}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from TicketBari Server ');
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
