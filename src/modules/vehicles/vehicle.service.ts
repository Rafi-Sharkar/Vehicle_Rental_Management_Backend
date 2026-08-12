import fs from 'fs';
import {
  VehicleRepository,
  VehicleRecord,
  VehicleQueryOptions,
  PaginatedResult
} from './vehicle.repository';
import { AppError } from '../../utils/appError';

export interface CreateVehicleDTO {
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path?: string | null;
}

export interface UpdateVehicleDTO {
  name?: string;
  plate_number?: string;
  category?: string;
  daily_rate?: number;
  photo_path?: string | null;
}

export class VehicleService {
  private vehicleRepo: VehicleRepository;

  constructor() {
    this.vehicleRepo = new VehicleRepository();
  }

  public async getVehicles(options: VehicleQueryOptions): Promise<PaginatedResult<VehicleRecord>> {
    return this.vehicleRepo.findAll(options);
  }

  public async getVehicleById(id: number): Promise<VehicleRecord> {
    const vehicle = await this.vehicleRepo.findById(id);
    if (!vehicle) {
      throw new AppError(`Vehicle with ID ${id} not found`, 404);
    }
    return vehicle;
  }

  public async createVehicle(dto: CreateVehicleDTO): Promise<VehicleRecord> {
    const existing = await this.vehicleRepo.findByPlateNumber(dto.plate_number);
    if (existing) {
      if (dto.photo_path) {
        this.deleteFile(dto.photo_path);
      }
      throw new AppError(`Vehicle with plate number ${dto.plate_number} already exists`, 400);
    }

    return this.vehicleRepo.create(dto);
  }

  public async updateVehicle(id: number, dto: UpdateVehicleDTO): Promise<VehicleRecord> {
    const currentVehicle = await this.getVehicleById(id);

    if (dto.plate_number && dto.plate_number !== currentVehicle.plate_number) {
      const existing = await this.vehicleRepo.findByPlateNumber(dto.plate_number, id);
      if (existing) {
        if (dto.photo_path) {
          this.deleteFile(dto.photo_path);
        }
        throw new AppError(`Vehicle with plate number ${dto.plate_number} already exists`, 400);
      }
    }

    if (dto.photo_path && currentVehicle.photo_path) {
      this.deleteFile(currentVehicle.photo_path);
    }

    const updated = await this.vehicleRepo.update(id, dto);
    if (!updated) {
      throw new AppError(`Failed to update vehicle with ID ${id}`, 400);
    }

    return updated;
  }

  public async deleteVehicle(id: number): Promise<void> {
    const currentVehicle = await this.getVehicleById(id);
    const success = await this.vehicleRepo.softDelete(id);
    if (!success) {
      throw new AppError(`Vehicle with ID ${id} could not be deleted`, 400);
    }

    if (currentVehicle.photo_path) {
      this.deleteFile(currentVehicle.photo_path);
    }
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error(`Failed to delete file at ${filePath}:`, err);
    }
  }
}
