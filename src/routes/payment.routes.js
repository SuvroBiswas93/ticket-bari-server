import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { auth } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { paymentValidation } from '../validations/payment.validation.js';

const router = express.Router();

router.post('/payment-checkout-session', auth, validate(paymentValidation.createCheckoutSession), paymentController.createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
router.get('/transactions', auth, paymentController.getUserTransactions);
router.get('/transactions/:id', auth, paymentController.getTransactionById);

export default router;