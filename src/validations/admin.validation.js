import Joi from 'joi';

export const adminValidation = {
    updateUserRole: Joi.object({
      role: Joi.string().valid('user', 'vendor', 'admin').required()
    }),
  
    toggleFraudStatus: Joi.object({
      isFraud: Joi.boolean().required()
    }),
  
    updateVerification: Joi.object({
      status: Joi.string().valid('approved', 'rejected').required()
    }),
  
    advertiseTicket: Joi.object({
      isAdvertised: Joi.boolean().required()
    }),
  
    analytics: Joi.object({
      timeframe: Joi.string().valid('weekly', 'monthly', 'yearly').default('monthly')
    })
  };