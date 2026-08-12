import db from '../../config/db';

export interface VehicleRecord {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  daily_rate: number;
  photo_path?: string | null;
  deleted_at?: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface VehicleQueryOptions {
  page: number;
  limit: number;
  category?: string;
  name?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export class VehicleRepository {
  public async findAll(options: VehicleQueryOptions): Promise<PaginatedResult<VehicleRecord>> {
    const { page, limit, category, name } = options;
    const offset = (page - 1) * limit;

    const baseQuery = db<VehicleRecord>('vehicles').whereNull('deleted_at');

    if (category) {
      baseQuery.andWhere('category', 'ilike', `%${category}%`);
    }

    if (name) {
      baseQuery.andWhere('name', 'ilike', `%${name}%`);
    }

    const countResult = await baseQuery
      .clone()
      .count<{ count: string | number }>('id as count')
      .first();
    const total = Number(countResult?.count || 0);

    const data = await baseQuery.orderBy('id', 'desc').limit(limit).offset(offset);

    return {
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1
      }
    };
  }

  public async findById(id: number): Promise<VehicleRecord | undefined> {
    return db<VehicleRecord>('vehicles').where({ id }).whereNull('deleted_at').first();
  }

  public async findByPlateNumber(
    plateNumber: string,
    excludeId?: number
  ): Promise<VehicleRecord | undefined> {
    const query = db<VehicleRecord>('vehicles')
      .where({ plate_number: plateNumber })
      .whereNull('deleted_at');

    if (excludeId) {
      query.andWhereNot('id', excludeId);
    }

    return query.first();
  }

  public async create(data: Partial<VehicleRecord>): Promise<VehicleRecord> {
    const [vehicle] = await db<VehicleRecord>('vehicles').insert(data).returning('*');
    return vehicle;
  }

  public async update(
    id: number,
    data: Partial<VehicleRecord>
  ): Promise<VehicleRecord | undefined> {
    const [updated] = await db<VehicleRecord>('vehicles')
      .where({ id })
      .whereNull('deleted_at')
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    return updated;
  }

  public async softDelete(id: number): Promise<boolean> {
    const affected = await db('vehicles').where({ id }).whereNull('deleted_at').update({
      deleted_at: new Date(),
      updated_at: new Date()
    });
    return affected > 0;
  }
}
