import {env} from './config/env.js';
import express from 'express';
import cors from 'cors';
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
const allowedOrigins = [env.clientUrl, 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5000'];
const port = env.port;

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log(origin, 'origin');
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Set-Cookie']
}));

// Apply raw body parser for webhook route (must be before JSON parser)
app.use('/api/payment/webhook', express.raw({ type: 'application/json' }));

const jsonParser = express.json({ limit: '10mb' });
const urlencodedParser = express.urlencoded({ extended: true, limit: '10mb' });

app.use((req, res, next) => {
  if (req.path === '/api/payment/webhook') {
    return next();
  }
  jsonParser(req, res, next);
});

app.use((req, res, next) => {
  if (req.path === '/api/payment/webhook') {
    return next();
  }
  urlencodedParser(req, res, next);
});

app.get('/', (_req, res) => {
  res.json({ message: 'server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/payment', paymentRoutes);
// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();
    await initializeAdmin();
    initializeFirebase();
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
}

startServer().catch(console.error);
