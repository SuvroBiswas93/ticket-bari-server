import dotenv from 'dotenv';
dotenv.config();

export const env = {
    clientUrl: process.env.CLIENT_URL,
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI,
    dbName: process.env.DB_NAME,
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
};