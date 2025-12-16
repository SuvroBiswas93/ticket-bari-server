import Joi from 'joi';

export const ticketValidation = {
    createTicket: Joi.object({
      title: Joi.string().min(3).max(200).required(),
      from: Joi.string().required(),
      to: Joi.string().required(),
      transportType: Joi.string().required(),
      price: Joi.number().min(0).required(),
      totalQuantity: Joi.number().integer().min(1).required(),
      departureTime: Joi.date().iso().greater('now').required(),
      perks: Joi.array().items(Joi.string()).default([]),
      image: Joi.string().uri().required()
    }),
  
    updateTicket: Joi.object({
      title: Joi.string().min(3).max(200),
      from: Joi.string(),
      to: Joi.string(),
      transportType: Joi.string(),
      price: Joi.number().min(0),
      totalQuantity: Joi.number().integer().min(1),
      departureTime: Joi.date().iso().greater('now'),
      perks: Joi.array().items(Joi.string()),
      image: Joi.string().uri()
    }),
  
    searchTickets: Joi.object({
      search: Joi.string().allow(''),
      from: Joi.string().allow(''),
      to: Joi.string().allow(''),
      transportType: Joi.string().allow(''),
      sortBy: Joi.string().valid('price_asc', 'price_desc', 'departure_asc', 'departure_desc', '').default('departure_asc'),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(50).default(9)
    })
  };