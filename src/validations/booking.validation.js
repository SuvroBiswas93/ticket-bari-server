import Joi from 'joi';

export const bookingValidation = {
    createBooking: Joi.object({
      ticketId: Joi.string().required(),
      bookingQuantity: Joi.number().integer().min(1).required()
    }),
  
    updateStatus: Joi.object({
      status: Joi.string().valid('accepted', 'rejected').required()
    }),
  
    processPayment: Joi.object({
      paymentId: Joi.string().required()
    })
  };