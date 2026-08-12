import db from '../../config/db';
import {
  RentalRepository,
  RentalRecord,
  RentalQueryOptions,
  RentalStatus
} from './rental.repository';
import { VehicleRepository } from '../vehicles/vehicle.repository';
import { DateUtil } from '../../utils/dateUtils';
import { AppError } from '../../utils/appError';

export interface CreateRentalDTO {
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  status?: RentalStatus;
}

export interface UpdateRentalDTO {
  vehicle_id?: number;
  customer_name?: string;
  customer_phone?: string;
  start_date?: string;
  end_date?: string;
  status?: RentalStatus;
}

export class RentalService {
  private rentalRepo: RentalRepository;
  private vehicleRepo: VehicleRepository;

  constructor() {
    this.rentalRepo = new RentalRepository();
    this.vehicleRepo = new VehicleRepository();
  }

  public async getRentals(options: RentalQueryOptions) {
    return this.rentalRepo.findAll(options);
  }

  public async getRentalById(id: number) {
    const rental = await this.rentalRepo.findById(id);
    if (!rental) {
      throw new AppError(`Rental with ID ${id} not found`, 404);
    }
    return rental;
  }

  public async createRental(dto: CreateRentalDTO): Promise<RentalRecord> {
    const vehicle = await this.vehicleRepo.findById(dto.vehicle_id);
    if (!vehicle) {
      throw new AppError(`Vehicle with ID ${dto.vehicle_id} not found`, 404);
    }

    const startDateStr = new Date(dto.start_date).toISOString().split('T')[0];
    const endDateStr = new Date(dto.end_date).toISOString().split('T')[0];

    return db.transaction(async (trx) => {
      const existingOverlap = await this.rentalRepo.findOverlappingRental(
        dto.vehicle_id,
        startDateStr,
        endDateStr,
        undefined,
        trx
      );

      if (existingOverlap) {
        throw new AppError('The vehicle is already booked for overlapping dates', 409);
      }

      const days = DateUtil.calculateDays(startDateStr, endDateStr);
      const dailyRate = Number(vehicle.daily_rate);
      const total_amount = Number((days * dailyRate).toFixed(2));

      return this.rentalRepo.create(
        {
          vehicle_id: dto.vehicle_id,
          customer_name: dto.customer_name,
          customer_phone: dto.customer_phone,
          start_date: startDateStr,
          end_date: endDateStr,
          total_amount,
          status: dto.status || 'booked'
        },
        trx
      );
    });
  }

  public async updateRental(id: number, dto: UpdateRentalDTO): Promise<RentalRecord> {
    const currentRental = await this.getRentalById(id);

    const vehicleId = dto.vehicle_id || currentRental.vehicle_id;
    const startDateStr = dto.start_date
      ? new Date(dto.start_date).toISOString().split('T')[0]
      : new Date(currentRental.start_date).toISOString().split('T')[0];
    const endDateStr = dto.end_date
      ? new Date(dto.end_date).toISOString().split('T')[0]
      : new Date(currentRental.end_date).toISOString().split('T')[0];
    const targetStatus = dto.status || currentRental.status;

    const vehicle = await this.vehicleRepo.findById(vehicleId);
    if (!vehicle) {
      throw new AppError(`Vehicle with ID ${vehicleId} not found`, 404);
    }

    return db.transaction(async (trx) => {
      if (['booked', 'ongoing', 'completed'].includes(targetStatus)) {
        const existingOverlap = await this.rentalRepo.findOverlappingRental(
          vehicleId,
          startDateStr,
          endDateStr,
          id,
          trx
        );

        if (existingOverlap) {
          throw new AppError('The vehicle is already booked for overlapping dates', 409);
        }
      }

      const days = DateUtil.calculateDays(startDateStr, endDateStr);
      const dailyRate = Number(vehicle.daily_rate);
      const total_amount = Number((days * dailyRate).toFixed(2));

      const updated = await this.rentalRepo.update(
        id,
        {
          ...dto,
          vehicle_id: vehicleId,
          start_date: startDateStr,
          end_date: endDateStr,
          total_amount,
          status: targetStatus
        },
        trx
      );

      if (!updated) {
        throw new AppError(`Failed to update rental with ID ${id}`, 400);
      }

      return updated;
    });
  }

  public async deleteRental(id: number): Promise<void> {
    await this.getRentalById(id);
    const success = await this.rentalRepo.delete(id);
    if (!success) {
      throw new AppError(`Failed to delete rental with ID ${id}`, 400);
    }
  }
}
