import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { auth } from '../middleware/auth.js';
import { adminOnly } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { adminValidation } from '../validations/admin.validation.js';

const router = express.Router();

router.get('/users', auth, adminOnly, adminController.getAllUsers);
router.put('/users/:id/role', auth, adminOnly, validate(adminValidation.updateUserRole), adminController.updateUserRole);
router.put('/users/:id/fraud', auth, adminOnly, validate(adminValidation.toggleFraudStatus), adminController.toggleVendorFraudStatus);

router.get('/tickets/all', auth, adminOnly, adminController.getAllTickets);
router.put('/tickets/:id/verify', auth, adminOnly, validate(adminValidation.updateVerification), adminController.updateVerificationStatus);
router.put('/tickets/:id/advertise', auth, adminOnly, validate(adminValidation.advertiseTicket), adminController.toggleAdvertisement);

router.get('/stats', auth, adminOnly, adminController.getDashboardStats);
router.get('/analytics/revenue', auth, adminOnly, validate(adminValidation.analytics), adminController.getRevenueAnalytics);

export default router;