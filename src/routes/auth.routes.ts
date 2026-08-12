import { Router } from 'express';
import { AuthController } from '../modules/auth/auth.controller';
import { validateRequest, ValidationSource } from '../middlewares/validate.middleware';
import { loginSchema, registerSchema, updateProfileSchema } from '../modules/auth/auth.schema';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';
import { authenticateToken } from '../middlewares/auth.middleware';

const router = Router();
const authController = new AuthController();

// POST /auth/register
router.post(
  '/register',
  validateRequest(registerSchema, ValidationSource.BODY),
  authController.register
);

// POST /auth/login
router.post(
  '/login',
  authRateLimiter,
  validateRequest(loginSchema, ValidationSource.BODY),
  authController.login
);

// GET /auth/profile (Protected)
router.get('/profile', authenticateToken, authController.getProfile);

// PATCH /auth/profile (Protected)
router.patch(
  '/profile',
  authenticateToken,
  validateRequest(updateProfileSchema, ValidationSource.BODY),
  authController.updateProfile
);

// DELETE /auth/profile (Protected)
router.delete('/profile', authenticateToken, authController.deleteProfile);

export default router;
