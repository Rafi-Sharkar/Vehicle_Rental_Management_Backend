import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { ENV } from '../config/env';
import { ResponseUtil } from '../utils/apiResponse';
import { AuthUserPayload } from '../@types/express';

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    ResponseUtil.error(res, 'Access token is missing or invalid', 401);
    return;
  }

  try {
    const decoded = jwt.verify(token, ENV.JWT.SECRET) as AuthUserPayload;
    req.user = decoded;
    next();
  } catch (_err) {
    ResponseUtil.error(res, 'Invalid or expired token', 401);
    return;
  }
};
