import admin from 'firebase-admin';
import { env } from './env.js';


export function initializeFirebase() {
  try {
    if (!admin.apps.length) {
       const result = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: env.firebaseProjectId,
          privateKey: env.firebasePrivateKey?.replace(/\\n/g, '\n'),
          clientEmail: env.firebaseClientEmail,
        }),
      });
      console.log('Firebase Admin SDK initialized');
      return result;
    }  else {
        console.log('Firebase Admin SDK already initialized');
        return admin.app();
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
    throw error;
  }
}

export async function verifyIdToken(idToken) {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error(' Firebase token verification error:', error.message);
    throw new Error('Invalid Firebase token');
  }
}

export async function getUserByUid(uid) {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return userRecord;
  } catch (error) {
    console.error('Firebase get user error:', error.message);
    throw new Error('User not found in Firebase');
  }
}

export function getAuth() {
  return admin.auth();
}