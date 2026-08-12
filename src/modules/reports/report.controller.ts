import { Request, Response, NextFunction } from 'express';
import { ReportService } from './report.service';
import { ResponseUtil } from '../../utils/apiResponse';

export class ReportController {
  private reportService: ReportService;

  constructor() {
    this.reportService = new ReportService();
  }

  public getMonthlyReport = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const month = req.query.month as string;
      const vehicleId = req.query.vehicle_id ? Number(req.query.vehicle_id) : undefined;

      const report = await this.reportService.getMonthlyReport(month, vehicleId);
      ResponseUtil.success(res, report, 'Monthly rental report generated successfully');
    } catch (error) {
      next(error);
    }
  };
}
