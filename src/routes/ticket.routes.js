import express from 'express';
import ticketController from '../controllers/ticket.controller.js';
import { auth } from '../middleware/auth.js';
import { vendorOnly, vendorOrAdmin } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { ticketValidation } from '../validations/ticket.validation.js';

const router = express.Router();

router.get('/', validate(ticketValidation.searchTickets), ticketController.searchTickets);
router.get('/advertised', ticketController.getAdvertisedTickets);
router.get('/latest', ticketController.getLatestTickets);
router.get('/:id', ticketController.getTicketById);

router.post('/', auth, validate(ticketValidation.createTicket), ticketController.createTicket);
router.get('/vendor/my-tickets', auth, vendorOrAdmin, ticketController.getVendorTickets);
router.put('/:id', auth, vendorOrAdmin, validate(ticketValidation.updateTicket), ticketController.updateTicket);
router.delete('/:id', auth, vendorOnly, ticketController.deleteTicket);

export default router;