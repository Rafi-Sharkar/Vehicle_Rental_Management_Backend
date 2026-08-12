import bcrypt from 'bcryptjs';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { AuthRepository, StaffRecord } from './auth.repository';
import { ENV } from '../../config/env';
import { AppError } from '../../utils/appError';

export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  email: string;
  password: string;
  name: string;
}

export interface UpdateProfileDTO {
  email?: string;
  password?: string;
  name?: string;
}

export interface StaffProfile {
  id: number;
  email: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthResponse {
  token: string;
  staff: StaffProfile;
}

export class AuthService {
  private authRepo: AuthRepository;

  constructor() {
    this.authRepo = new AuthRepository();
  }

  public async register(dto: RegisterDTO): Promise<AuthResponse> {
    const existing = await this.authRepo.findByEmail(dto.email);
    if (existing) {
      throw new AppError(`Staff with email ${dto.email} already exists`, 400);
    }

    const password_hash = await bcrypt.hash(dto.password, 10);
    const staff = await this.authRepo.create({
      email: dto.email,
      password_hash,
      name: dto.name
    });

    const profile = this.sanitizeStaff(staff);
    const token = this.generateToken(profile);

    return {
      token,
      staff: profile
    };
  }

  public async login(dto: LoginDTO): Promise<AuthResponse> {
    const staff = await this.authRepo.findByEmail(dto.email);

    if (!staff) {
      throw new AppError('Invalid email or password', 401);
    }

    const isMatch = await bcrypt.compare(dto.password, staff.password_hash);
    if (!isMatch) {
      throw new AppError('Invalid email or password', 401);
    }

    const profile = this.sanitizeStaff(staff);
    const token = this.generateToken(profile);

    return {
      token,
      staff: profile
    };
  }

  public async getProfile(userId: number): Promise<StaffProfile> {
    const staff = await this.authRepo.findById(userId);
    if (!staff) {
      throw new AppError('Staff profile not found', 404);
    }
    return this.sanitizeStaff(staff);
  }

  public async updateProfile(userId: number, dto: UpdateProfileDTO): Promise<StaffProfile> {
    const current = await this.authRepo.findById(userId);
    if (!current) {
      throw new AppError('Staff profile not found', 404);
    }

    const updateData: Partial<StaffRecord> = {};

    if (dto.name) {
      updateData.name = dto.name;
    }

    if (dto.email && dto.email !== current.email) {
      const existing = await this.authRepo.findByEmail(dto.email, userId);
      if (existing) {
        throw new AppError(`Email ${dto.email} is already in use`, 400);
      }
      updateData.email = dto.email;
    }

    if (dto.password) {
      updateData.password_hash = await bcrypt.hash(dto.password, 10);
    }

    const updated = await this.authRepo.update(userId, updateData);
    if (!updated) {
      throw new AppError('Failed to update staff profile', 400);
    }

    return this.sanitizeStaff(updated);
  }

  public async deleteProfile(userId: number): Promise<void> {
    const current = await this.authRepo.findById(userId);
    if (!current) {
      throw new AppError('Staff profile not found', 404);
    }

    const deleted = await this.authRepo.delete(userId);
    if (!deleted) {
      throw new AppError('Failed to delete staff profile', 400);
    }
  }

  private sanitizeStaff(staff: StaffRecord): StaffProfile {
    return {
      id: staff.id,
      email: staff.email,
      name: staff.name,
      created_at: staff.created_at,
      updated_at: staff.updated_at
    };
  }

  private generateToken(profile: { id: number; email: string; name: string }): string {
    const payload = {
      id: profile.id,
      email: profile.email,
      name: profile.name
    };
    const secret: Secret = ENV.JWT.SECRET;
    const options: SignOptions = {
      expiresIn: ENV.JWT.EXPIRES_IN as SignOptions['expiresIn']
    };
    return jwt.sign(payload, secret, options);
  }
}
