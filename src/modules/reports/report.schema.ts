import Joi from 'joi';

export const reportQuerySchema = Joi.object({
  month: Joi.string()
    .pattern(/^\d{4}-(0[1-9]|1[0-2])$/)
    .required()
    .messages({
      'string.pattern.base': 'month must be in format YYYY-MM (e.g. 2026-08)',
      'any.required': 'month query parameter is required (YYYY-MM)'
    }),
  vehicle_id: Joi.number().integer().positive().optional()
});
