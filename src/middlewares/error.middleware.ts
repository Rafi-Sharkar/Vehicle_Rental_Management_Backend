import { Request, Response, NextFunction } from 'express';
import { ResponseUtil } from '../utils/apiResponse';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Unhandled Error:', err);

  const errorObj = err as {
    statusCode?: number;
    status?: number;
    message?: string;
    details?: unknown;
  };
  const statusCode = errorObj.statusCode || errorObj.status || 500;
  const message = errorObj.message || 'Internal Server Error';

  ResponseUtil.error(res, message, statusCode, errorObj.details || undefined);
};
