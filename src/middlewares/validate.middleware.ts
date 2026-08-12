import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import { ResponseUtil } from '../utils/apiResponse';

export enum ValidationSource {
  BODY = 'body',
  QUERY = 'query',
  PARAMS = 'params'
}

export const validateRequest = (
  schema: Schema,
  source: ValidationSource = ValidationSource.BODY
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const details = error.details.map((detail) => detail.message);
      ResponseUtil.error(res, 'Validation Error', 400, details);
      return;
    }

    req[source] = value;
    next();
  };
};
