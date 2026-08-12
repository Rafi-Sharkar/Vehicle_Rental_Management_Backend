import { Router } from 'express';
import { RentalController } from '../modules/rentals/rental.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { validateRequest, ValidationSource } from '../middlewares/validate.middleware';
import {
  createRentalSchema,
  updateRentalSchema,
  rentalQuerySchema
} from '../modules/rentals/rental.schema';

const router = Router();
const rentalController = new RentalController();

// Apply JWT Authentication Middleware to all rental routes
router.use(authenticateToken);

// GET /rentals
router.get(
  '/',
  validateRequest(rentalQuerySchema, ValidationSource.QUERY),
  rentalController.getRentals
);

// GET /rentals/:id
router.get('/:id', rentalController.getRentalById);

// POST /rentals
router.post(
  '/',
  validateRequest(createRentalSchema, ValidationSource.BODY),
  rentalController.createRental
);

// PUT /rentals/:id
router.put(
  '/:id',
  validateRequest(updateRentalSchema, ValidationSource.BODY),
  rentalController.updateRental
);

// DELETE /rentals/:id
router.delete('/:id', rentalController.deleteRental);

export default router;
