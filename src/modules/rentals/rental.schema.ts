import Joi from 'joi';

export const createRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().required().messages({
    'any.required': 'vehicle_id is required'
  }),
  customer_name: Joi.string().trim().required().messages({
    'any.required': 'customer_name is required'
  }),
  customer_phone: Joi.string().trim().required().messages({
    'any.required': 'customer_phone is required'
  }),
  start_date: Joi.date().iso().required().messages({
    'any.required': 'start_date (YYYY-MM-DD) is required'
  }),
  end_date: Joi.date().iso().min(Joi.ref('start_date')).required().messages({
    'date.min': 'end_date must be on or after start_date',
    'any.required': 'end_date (YYYY-MM-DD) is required'
  }),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled').optional()
});

export const updateRentalSchema = Joi.object({
  vehicle_id: Joi.number().integer().positive().optional(),
  customer_name: Joi.string().trim().optional(),
  customer_phone: Joi.string().trim().optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled').optional()
}).custom((value, helpers) => {
  if (value.start_date && value.end_date) {
    if (new Date(value.end_date) < new Date(value.start_date)) {
      return helpers.error('date.min');
    }
  }
  return value;
});

export const rentalQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  vehicle_id: Joi.number().integer().positive().optional(),
  status: Joi.string().valid('booked', 'ongoing', 'completed', 'cancelled').optional(),
  start_date: Joi.date().iso().optional(),
  end_date: Joi.date().iso().optional(),
  search: Joi.string().trim().optional()
});
