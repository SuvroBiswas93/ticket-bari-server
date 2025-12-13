const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const express = require('express')
const cors = require('cors')
const app = express()
const admin = require('firebase-admin')
const stripe = require('stripe')(process.env.STRIPE_SECRET);
const crypto = require("crypto");
const port = 3000


function generatebookingId() {
    const prefix = "BK"; 
    const date = new Date().toISOString().slice(0, 10).replace(/-/g, ""); 
    const random = crypto.randomBytes(3).toString("hex").toUpperCase(); 

    return `${prefix}-${date}-${random}`;
}
//midddleware
app.use(cors())
app.use(express.json())

const verifyFBToken = async (req, res, next) => {
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).send({ message: 'unauthorized access' })
    }

    try {
        const idToken = token.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(idToken);
        console.log('decoded in the token', decoded);
        req.decoded_email = decoded.email;
        next();
    }
    catch (err) {
        return res.status(401).send({ message: 'unauthorized access' })
    }


}

const uri = process.env.MONGODB_URI;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
     const db = client.db('ticketBari-db')
     const usersCollection = db.collection('users')
     const ticketsCollection = db.collection('tickets')
     const bookingsCollection = db.collection('bookings')
     const paymentCollecttion = db.collection('payments')

     app.post('/payment-checkout-session', async (req, res) => {
      const { bookingId, ticketTitle, totalPrice, userEmail, ticketId } = req.body;

      const amount = parseInt(totalPrice) * 100; // convert to cents

      const session = await stripe.checkout.sessions.create({
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    unit_amount: amount,
                    product_data: {
                        name: `Ticket: ${ticketTitle}`
                    }
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        metadata: {
            bookingId,
            ticketId,
            userEmail
        },
        customer_email: userEmail,
        success_url: `${process.env.SITE_DOMAIN}/dashboard/payment-success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.SITE_DOMAIN}/dashboard/payment-cancelled`,
    });

    res.send({ url: session.url });
     });



     app.patch('/payment-success', async (req, res) => {
    try {
        const sessionId = req.query.session_id;
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        console.log('session retrieve', session);

        if (session.payment_status !== 'paid') {
            return res.send({ success: false, message: 'Payment not completed' });
        }

        const bookingId = session.metadata.bookingId;
        const ticketId = session.metadata.ticketId;
        const bookedId = generatebookingId();

        // 1. Update booking status to "paid" and add trackingId
        const bookingUpdate = await bookingsCollection.updateOne(
            { _id: new ObjectId(bookingId) },
            { $set: { status: 'paid', bookedId } }
        );

        // 2. Reduce ticket quantity
        const booking = await bookingsCollection.findOne({ _id: new ObjectId(bookingId) });
        await ticketsCollection.updateOne(
            { _id: new ObjectId(ticketId) },
            { $inc: { quantity: -booking.quantity } }
        );

        // 3. Insert into transactions collection
        const transaction = {
            transactionId: session.payment_intent,
            bookingId,
            ticketId,
            ticketTitle: session.metadata.ticketTitle,
            amount: session.amount_total / 100,
            currency: session.currency,
            userEmail: session.customer_email,
            paidAt: new Date()
        };
        const resultTransaction = await transactionsCollection.insertOne(transaction);

        res.send({
            success: true,
            bookingModified: bookingUpdate,
            trackingId,
            transactionId: session.payment_intent,
            transactionInfo: resultTransaction
        });

    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: 'Server error' });
    }
});



    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello from the server...')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})