import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { ResponseUtil } from '../../utils/apiResponse';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      ResponseUtil.success(res, result, 'Staff registered successfully', 201);
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      ResponseUtil.success(res, result, 'Login successful');
    } catch (error) {
      next(error);
    }
  };

  public getProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.authService.getProfile(userId);
      ResponseUtil.success(res, profile, 'Staff profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  };

  public updateProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      const profile = await this.authService.updateProfile(userId, req.body);
      ResponseUtil.success(res, profile, 'Staff profile updated successfully');
    } catch (error) {
      next(error);
    }
  };

  public deleteProfile = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user!.id;
      await this.authService.deleteProfile(userId);
      ResponseUtil.success(res, null, 'Staff profile deleted successfully');
    } catch (error) {
      next(error);
    }
  };
}
