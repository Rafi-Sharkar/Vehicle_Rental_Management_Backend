import { Router } from 'express';
import { ReportController } from '../modules/reports/report.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest, ValidationSource } from '../middlewares/validate.middleware';
import { reportQuerySchema } from '../modules/reports/report.schema';

const router = Router();
const reportController = new ReportController();

// Apply JWT Authentication Middleware to all report routes
router.use(authenticateToken);

// GET /reports/rentals?month=YYYY-MM
router.get(
  '/rentals',
  validateRequest(reportQuerySchema, ValidationSource.QUERY),
  reportController.getMonthlyReport
);

export default router;
