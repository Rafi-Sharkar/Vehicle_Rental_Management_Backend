import { Knex } from 'knex';
import db from '../../config/db';

export type RentalStatus = 'booked' | 'ongoing' | 'completed' | 'cancelled';

export interface RentalRecord {
  id: number;
  vehicle_id: number;
  customer_name: string;
  customer_phone: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  status: RentalStatus;
  created_at: Date;
  updated_at: Date;
}

export interface RentalQueryOptions {
  page: number;
  limit: number;
  vehicle_id?: number;
  status?: RentalStatus;
  start_date?: string;
  end_date?: string;
  search?: string;
}

export class RentalRepository {
  public async findAll(options: RentalQueryOptions) {
    const { page, limit, vehicle_id, status, start_date, end_date, search } = options;
    const offset = (page - 1) * limit;

    const baseQuery = db<RentalRecord>('rentals')
      .join('vehicles', 'rentals.vehicle_id', 'vehicles.id')
      .select('rentals.*', 'vehicles.name as vehicle_name', 'vehicles.plate_number');

    if (vehicle_id) {
      baseQuery.andWhere('rentals.vehicle_id', vehicle_id);
    }

    if (status) {
      baseQuery.andWhere('rentals.status', status);
    }

    if (start_date && end_date) {
      baseQuery
        .andWhere('rentals.start_date', '<=', end_date)
        .andWhere('rentals.end_date', '>=', start_date);
    } else if (start_date) {
      baseQuery.andWhere('rentals.start_date', '>=', start_date);
    } else if (end_date) {
      baseQuery.andWhere('rentals.end_date', '<=', end_date);
    }

    if (search) {
      baseQuery.andWhere((builder) => {
        builder
          .where('rentals.customer_name', 'ilike', `%${search}%`)
          .orWhere('rentals.customer_phone', 'ilike', `%${search}%`);
      });
    }

    const countQuery = db('rentals');
    if (vehicle_id) countQuery.andWhere('vehicle_id', vehicle_id);
    if (status) countQuery.andWhere('status', status);
    if (start_date && end_date) {
      countQuery.andWhere('start_date', '<=', end_date).andWhere('end_date', '>=', start_date);
    } else if (start_date) {
      countQuery.andWhere('start_date', '>=', start_date);
    } else if (end_date) {
      countQuery.andWhere('end_date', '<=', end_date);
    }
    if (search) {
      countQuery.andWhere((builder) => {
        builder
          .where('customer_name', 'ilike', `%${search}%`)
          .orWhere('customer_phone', 'ilike', `%${search}%`);
      });
    }

    const countResult = await countQuery.count<{ count: string | number }>('id as count').first();
    const total = Number(countResult?.count || 0);

    const data = await baseQuery.orderBy('rentals.id', 'desc').limit(limit).offset(offset);

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

  public async findById(
    id: number
  ): Promise<(RentalRecord & { vehicle_name: string; plate_number: string; daily_rate: number }) | undefined> {
    return db<RentalRecord>('rentals')
      .join('vehicles', 'rentals.vehicle_id', 'vehicles.id')
      .select(
        'rentals.*',
        'vehicles.name as vehicle_name',
        'vehicles.plate_number',
        'vehicles.daily_rate'
      )
      .where('rentals.id', id)
      .first();
  }

  /**
   * Checks whether an active overlapping rental exists for a vehicle inside a transaction with lock.
   */
  public async findOverlappingRental(
    vehicleId: number,
    startDate: string,
    endDate: string,
    excludeRentalId?: number,
    trx?: Knex.Transaction
  ): Promise<RentalRecord | undefined> {
    const query = (trx || db)('rentals')
      .where('vehicle_id', vehicleId)
      .whereIn('status', ['booked', 'ongoing', 'completed']) // active rentals
      .andWhere('start_date', '<=', endDate)
      .andWhere('end_date', '>=', startDate);

    if (excludeRentalId) {
      query.andWhereNot('id', excludeRentalId);
    }

    if (trx) {
      query.forUpdate(); // acquire row lock for concurrency protection
    }

    return query.first();
  }

  public async create(data: Partial<RentalRecord>, trx?: Knex.Transaction): Promise<RentalRecord> {
    const [rental] = await (trx || db)<RentalRecord>('rentals').insert(data).returning('*');
    return rental;
  }

  public async update(
    id: number,
    data: Partial<RentalRecord>,
    trx?: Knex.Transaction
  ): Promise<RentalRecord | undefined> {
    const [updated] = await (trx || db)<RentalRecord>('rentals')
      .where({ id })
      .update({
        ...data,
        updated_at: new Date()
      })
      .returning('*');
    return updated;
  }

  public async delete(id: number): Promise<boolean> {
    const affected = await db('rentals').where({ id }).del();
    return affected > 0;
  }
}
