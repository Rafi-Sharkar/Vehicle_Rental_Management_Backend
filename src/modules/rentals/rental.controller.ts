import { Request, Response, NextFunction } from 'express';
import { RentalService } from './rental.service';
import { RentalStatus } from './rental.repository';
import { ResponseUtil } from '../../utils/apiResponse';

export class RentalController {
  private rentalService: RentalService;

  constructor() {
    this.rentalService = new RentalService();
  }

  public getRentals = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const vehicle_id = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;
      const status = req.query.status as RentalStatus | undefined;
      const start_date = req.query.start_date as string | undefined;
      const end_date = req.query.end_date as string | undefined;
      const search = req.query.search as string | undefined;

      const result = await this.rentalService.getRentals({
        page,
        limit,
        vehicle_id,
        status,
        start_date,
        end_date,
        search
      });

      ResponseUtil.success(res, result.data, 'Rentals retrieved successfully', 200, result.pagination);
    } catch (error) {
      next(error);
    }
  };

  public getRentalById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const rental = await this.rentalService.getRentalById(id);
      ResponseUtil.success(res, rental, 'Rental details retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public createRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const rental = await this.rentalService.createRental(req.body);
      ResponseUtil.success(res, rental, 'Rental created successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public updateRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      const rental = await this.rentalService.updateRental(id, req.body);
      ResponseUtil.success(res, rental, 'Rental updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteRental = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const id = Number(req.params.id);
      await this.rentalService.deleteRental(id);
      ResponseUtil.success(res, null, 'Rental deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
