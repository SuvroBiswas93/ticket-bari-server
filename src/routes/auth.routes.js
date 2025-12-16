import express from 'express';
import authController from '../controllers/auth.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', auth, authController.getProfile);
router.put('/profile', auth, authController.updateProfile);
router.post('/register-vendor', auth, authController.registerVendor);

export default router;