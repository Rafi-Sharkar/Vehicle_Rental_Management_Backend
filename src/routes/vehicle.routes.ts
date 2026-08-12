import { Router } from 'express';
import { VehicleController } from '../modules/vehicles/vehicle.controller';
import { authenticateToken } from '../middlewares/auth.middleware';
import { uploadVehiclePhoto } from '../middlewares/upload.middleware';
import { validateRequest, ValidationSource } from '../middlewares/validate.middleware';
import {
  createVehicleSchema,
  updateVehicleSchema,
  vehicleQuerySchema
} from '../modules/vehicles/vehicle.schema';

const router = Router();
const vehicleController = new VehicleController();

// Apply JWT Authentication Middleware to all vehicle routes
router.use(authenticateToken);

// GET /vehicles
router.get(
  '/',
  validateRequest(vehicleQuerySchema, ValidationSource.QUERY),
  vehicleController.getVehicles
);

// GET /vehicles/:id
router.get('/:id', vehicleController.getVehicleById);

// POST /vehicles (multipart/form-data)
router.post(
  '/',
  uploadVehiclePhoto.single('photo'),
  validateRequest(createVehicleSchema, ValidationSource.BODY),
  vehicleController.createVehicle
);

// PUT /vehicles/:id (multipart/form-data)
router.put(
  '/:id',
  uploadVehiclePhoto.single('photo'),
  validateRequest(updateVehicleSchema, ValidationSource.BODY),
  vehicleController.updateVehicle
);

// DELETE /vehicles/:id (soft delete)
router.delete('/:id', vehicleController.deleteVehicle);

export default router;
