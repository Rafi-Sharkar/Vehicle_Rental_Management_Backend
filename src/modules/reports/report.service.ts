import { ReportRepository, VehicleReportSummary } from './report.repository';

export interface MonthlyReportResponse {
  month: string;
  vehicles: VehicleReportSummary[];
  highest_revenue_vehicle: VehicleReportSummary | null;
}

export class ReportService {
  private reportRepo: ReportRepository;

  constructor() {
    this.reportRepo = new ReportRepository();
  }

  public async getMonthlyReport(month: string, vehicleId?: number): Promise<MonthlyReportResponse> {
    const vehicles = await this.reportRepo.getMonthlyRentalReport(month, vehicleId);

    let highest_revenue_vehicle: VehicleReportSummary | null = null;

    if (vehicles.length > 0) {
      // Find vehicle with maximum revenue
      const top = vehicles.reduce((prev, current) => {
        return current.revenue > prev.revenue ? current : prev;
      }, vehicles[0]);

      if (top.revenue > 0) {
        highest_revenue_vehicle = top;
      }
    }

    return {
      month,
      vehicles,
      highest_revenue_vehicle
    };
  }
}
