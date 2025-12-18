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

/* =========================
   CORS CONFIG (FIXED)
========================= */

const allowedOrigins = [
  env.clientUrl, // keep this exact (no slash)
  'http://localhost:3000',
  'http://localhost:5000',
  'https://online-ticket-booking-fullstack.netlify.app'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server, Postman, curl
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error(`❌ CORS blocked origin: ${origin}`);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Important for preflight requests
app.options('*', cors());

/* =========================
   BODY PARSERS
========================= */

// Stripe / webhook raw body (must come first)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

// Normal parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

/* =========================
   HEALTH CHECK
========================= */

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Server is running 🚀' });
});

/* =========================
   ROUTES
========================= */

app.use('/auth', authRoutes);
app.use('/tickets', ticketRoutes);
app.use('/bookings', bookingRoutes);
app.use('/admins', adminRoutes);
app.use('/payments', paymentRoutes);

/* =========================
   404 HANDLER
========================= */

app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */

app.use(errorHandler);

/* =========================
   SERVER INIT (VERCEL SAFE)
========================= */

async function startServer() {
  try {
    await connectDB();       // MUST be cached internally
    await initializeAdmin();
    initializeFirebase();

    // Local dev only (Vercel ignores this)
    if (env.nodeEnv !== 'production') {
      app.listen(env.port, () => {
        console.log(`Server running on port ${env.port}`);
      });
    }
  } catch (error) {
    console.error('❌ Server startup failed:', error);
  }
}

startServer();

export default app;
