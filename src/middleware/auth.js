import { verifyIdToken } from '../config/firebase.js';
import userRepository from '../repositories/user.repository.js';

export const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        status: 'error',
        message: 'No token provided. Please authenticate.'
      });
    }

    const idToken = authHeader.replace('Bearer ', '');
    const decodedToken = await verifyIdToken(idToken);
    
    let user = await userRepository.findOne({ 
      email: decodedToken.email 
    });

    if (!user) {
      user = await userRepository.create({
        name: decodedToken.name || decodedToken.email.split('@')[0],
        email: decodedToken.email,
        photoURL: decodedToken.picture || '',
        role: 'user',
        isActive: true,
        isFraud: false,
        firebaseUid: decodedToken.uid
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        status: 'error',
        message: 'Account is deactivated'
      });
    }

    req.user = user;
    req.firebaseToken = decodedToken;
    req.idToken = idToken;
    
    next();
  } catch (error) {
    console.error('Authentication error:', error.message);
    
    if (error.message === 'Invalid Firebase token') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid or expired token. Please login again.'
      });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed'
    });
  }
};