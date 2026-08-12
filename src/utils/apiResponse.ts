import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: unknown;
  meta?: unknown;
}

export class ResponseUtil {
  public static success<T>(
    res: Response,
    data: T,
    message = 'Success',
    statusCode = 200,
    meta?: unknown
  ): Response {
    const payload: ApiResponse<T> = {
      success: true,
      message,
      data,
      ...(meta ? { meta } : {})
    };
    return res.status(statusCode).json(payload);
  }

  public static error(
    res: Response,
    message = 'Internal Server Error',
    statusCode = 500,
    errorDetails?: unknown
  ): Response {
    const payload: ApiResponse = {
      success: false,
      message,
      ...(errorDetails !== undefined && { error: errorDetails })
    };
    return res.status(statusCode).json(payload);
  }
}
