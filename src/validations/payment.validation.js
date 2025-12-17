import Joi from 'joi';

export const paymentValidation = {
    createCheckoutSession: Joi.object({
      bookingId: Joi.string().required()
    }),
    handleCheckoutSessionCompleted: Joi.object({
      sessionId: Joi.string().required()
    })
  };