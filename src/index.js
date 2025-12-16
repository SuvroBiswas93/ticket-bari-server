import {env} from './config/env.js';
import express from 'express';
import cors from 'cors';
import { connectDB } from './config/database.js';
import { initializeFirebase } from './config/firebase.js';
import errorHandler from './middleware/error.js';

const app = express();
const allowedOrigins = [env.clientUrl, 'http://localhost:3000', 'http://localhost:5173'];
const port = env.port;

app.use(cors({
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get('/', (_req, res) => {
  res.json({ message: 'server is running' });
});


// 404 handler
app.use('*', (req, res) => {
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
