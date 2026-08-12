import { Request, Response, NextFunction } from 'express';
import { VehicleService } from './vehicle.service';
import { ResponseUtil } from '../../utils/apiResponse';

export class VehicleController {
  private vehicleService: VehicleService;

  constructor() {
    this.vehicleService = new VehicleService();
  }

  public getVehicles = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const category = req.query.category as string | undefined;
      const name = req.query.name as string | undefined;

      const result = await this.vehicleService.getVehicles({ page, limit, category, name });
      ResponseUtil.success(
        res,
        result.data,
        'Vehicles retrieved successfully',
        200,
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  };

  public getVehicleById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const vehicle = await this.vehicleService.getVehicleById(id);
      ResponseUtil.success(res, vehicle, 'Vehicle details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const photo_path = req.file ? req.file.path.replace(/\\/g, '/') : undefined;
      const vehicleData = {
        ...req.body,
        daily_rate: Number(req.body.daily_rate),
        ...(photo_path && { photo_path })
      };

      const vehicle = await this.vehicleService.createVehicle(vehicleData);
      ResponseUtil.success(res, vehicle, 'Vehicle created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public updateVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const photo_path = req.file ? req.file.path.replace(/\\/g, '/') : undefined;

      const vehicleData = {
        ...req.body,
        ...(req.body.daily_rate !== undefined && { daily_rate: Number(req.body.daily_rate) }),
        ...(photo_path && { photo_path })
      };

      const vehicle = await this.vehicleService.updateVehicle(id, vehicleData);
      ResponseUtil.success(res, vehicle, 'Vehicle updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteVehicle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.vehicleService.deleteVehicle(id);
      ResponseUtil.success(res, null, 'Vehicle deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
