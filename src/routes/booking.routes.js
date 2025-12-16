import express from 'express';
import bookingController from '../controllers/booking.controller.js';
import { auth } from '../middleware/auth.js';
import { userOnly, vendorOnly } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { bookingValidation } from '../validations/booking.validation.js';

const router = express.Router();

router.post('/', auth, userOnly, validate(bookingValidation.createBooking), bookingController.createBooking);
router.get('/user/my-bookings', auth, userOnly, bookingController.getUserBookings);
router.post('/:id/payment', auth, userOnly, validate(bookingValidation.processPayment), bookingController.processPayment);
router.delete('/:id/cancel', auth, userOnly, bookingController.cancelBooking);

router.get('/vendor/my-bookings', auth, vendorOnly, bookingController.getVendorBookings);
router.get('/vendor/pending', auth, vendorOnly, bookingController.getPendingBookings);
router.put('/:id/status', auth, vendorOnly, validate(bookingValidation.updateStatus), bookingController.updateBookingStatus);

router.get('/statistics', auth, bookingController.getBookingStatistics);

export default router;