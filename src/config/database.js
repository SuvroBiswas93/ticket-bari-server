import { MongoClient } from 'mongodb';
import { env } from './env.js';

let client = null;
let db = null;

export async function connectDB() {
  if (db) return db;
  
  const uri = env.mongoUri;
  const dbName = env.dbName;
  
  try {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 5
    });
    await client.connect();
    db = client.db(dbName);
    console.log('MongoDB connected successfully');
    await createIndexes();
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function createIndexes() {
  const collections = await db.listCollections().toArray();
  
  if (collections.find(c => c.name === 'users')) {
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    await db.collection('users').createIndex({ firebaseUid: 1 }, { sparse: true });
  }
  
  if (collections.find(c => c.name === 'tickets')) {
    await db.collection('tickets').createIndex({ vendorId: 1 });
    await db.collection('tickets').createIndex({ verificationStatus: 1 });
    await db.collection('tickets').createIndex({ isAdvertised: 1 });
    await db.collection('tickets').createIndex({ transportType: 1 });
    await db.collection('tickets').createIndex({ from: 1, to: 1 });
    await db.collection('tickets').createIndex({ departureDate: 1 });
    await db.collection('tickets').createIndex({ 
      from: 'text', 
      to: 'text', 
      title: 'text' 
    });
  }

  if (collections.find(c => c.name === 'bookings')) {
    await db.collection('bookings').createIndex({ userId: 1 });
    await db.collection('bookings').createIndex({ ticketId: 1 });
    await db.collection('bookings').createIndex({ vendorId: 1 });
    await db.collection('bookings').createIndex({ status: 1 });
  }

  if (collections.find(c => c.name === 'transactions')) {
    await db.collection('transactions').createIndex({ userId: 1 });
    await db.collection('transactions').createIndex({ bookingId: 1 });
    await db.collection('transactions').createIndex({ transactionId: 1 }, { unique: true });
  }
  
  console.log('Database indexes created');
}

export function getDB() {
  if (!db) throw new Error('Database not connected');
  return db;
}

export async function closeDB() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}