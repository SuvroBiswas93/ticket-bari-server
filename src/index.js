import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { connectDB } from './config/database.js';
import initializeAdmin from './utils/initializeAdmin.js';
import { initializeFirebase } from './config/firebase.js';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.routes.js';
import ticketRoutes from './routes/ticket.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import adminRoutes from './routes/admin.routes.js';
import paymentRoutes from './routes/payment.routes.js';

const app = express();


let isInitialized = false;

const initApp = async () => {
  if (isInitialized) return;

  await connectDB();       
  initializeFirebase();    
  await initializeAdmin();

  isInitialized = true;
};



const allowedOrigins = [
  env.clientUrl,
  'http://localhost:3000',
  'http://localhost:5000',
  'https://online-ticket-booking-fullstack.netlify.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);


app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));



app.use(async (_req, _res, next) => {
  try {
    await initApp();
    next();
  } catch (error) {
    console.error('Initialization failed:', error);
    next(error);
  }
});


app.get('/', (_req, res) => {
  res.json({ message: 'Server is running 🚀' });
});

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admins', adminRoutes);
app.use('/payments', paymentRoutes);


app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

export default app;
