import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import routes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { ResponseUtil } from './utils/apiResponse';

import { setupSwagger } from './config/swagger';

const app: Application = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Swagger UI Documentation at /docs
setupSwagger(app);

// Serve static uploaded photos
app.use('/uploads', express.static(ENV.UPLOAD_PATH));

// Healthcheck endpoint
app.get('/health', (_req: Request, res: Response) => {
  ResponseUtil.success(
    res,
    { status: 'UP', timestamp: new Date() },
    'VRM Backend Service is Healthy'
  );
});

// API Routes
app.use('/', routes);

// 404 Route Handler
app.use((_req: Request, res: Response) => {
  ResponseUtil.error(res, 'Requested endpoint not found', 404);
});

// Global Error Handler
app.use(errorHandler);

export default app;
