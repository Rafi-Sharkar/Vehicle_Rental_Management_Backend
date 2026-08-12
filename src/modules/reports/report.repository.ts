import db from '../../config/db';
import { DateUtil } from '../../utils/dateUtils';

export interface VehicleReportSummary {
  id: number;
  name: string;
  plate_number: string;
  category: string;
  total_bookings: number;
  days_rented: number;
  revenue: number;
}

export class ReportRepository {
  public async getMonthlyRentalReport(
    monthStr: string,
    vehicleId?: number
  ): Promise<VehicleReportSummary[]> {
    const { startStr, endStr } = DateUtil.getMonthBounds(monthStr);

    const query = db('vehicles')
      .select('vehicles.id', 'vehicles.name', 'vehicles.plate_number', 'vehicles.category')
      .countDistinct('rentals.id as total_bookings')
      .select(
        db.raw(
          `COALESCE(
            SUM(
              CASE
                WHEN rentals.id IS NOT NULL AND rentals.status IN ('booked', 'ongoing', 'completed')
                THEN (LEAST(rentals.end_date, ?::date) - GREATEST(rentals.start_date, ?::date) + 1)
                ELSE 0
              END
            ), 0
          )::integer as days_rented`,
          [endStr, startStr]
        )
      )
      .select(
        db.raw(
          `COALESCE(
            SUM(
              CASE
                WHEN rentals.id IS NOT NULL AND rentals.status IN ('booked', 'ongoing', 'completed')
                THEN (LEAST(rentals.end_date, ?::date) - GREATEST(rentals.start_date, ?::date) + 1) * vehicles.daily_rate
                ELSE 0
              END
            ), 0
          )::numeric(10,2) as revenue`,
          [endStr, startStr]
        )
      )
      .leftJoin('rentals', (join) => {
        join
          .on('vehicles.id', '=', 'rentals.vehicle_id')
          .andOnIn('rentals.status', ['booked', 'ongoing', 'completed'])
          .andOn(db.raw('rentals.start_date <= ?', [endStr]))
          .andOn(db.raw('rentals.end_date >= ?', [startStr]));
      })
      .whereNull('vehicles.deleted_at')
      .groupBy(
        'vehicles.id',
        'vehicles.name',
        'vehicles.plate_number',
        'vehicles.category',
        'vehicles.daily_rate'
      )
      .orderBy('revenue', 'desc');

    if (vehicleId) {
      query.andWhere('vehicles.id', vehicleId);
    }

    const rows = await query;

    return rows.map((row: Record<string, unknown>) => ({
      id: Number(row.id),
      name: row.name as string,
      plate_number: row.plate_number as string,
      category: row.category as string,
      total_bookings: Number(row.total_bookings || 0),
      days_rented: Number(row.days_rented || 0),
      revenue: Number(row.revenue || 0)
    }));
  }
}
