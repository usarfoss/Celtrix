import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimiter } from './setup/rateLimiter';
import { requestLogger } from './setup/requestLogger';
import { errorHandler, notFoundHandler } from './setup/errorHandlers';
import { router as apiRouter } from './setup/routes';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(cors());
  app.use(express.json({ limit: '2mb' }));
  app.use(requestLogger);
  app.use(rateLimiter);

  app.get('/health', (_req, res) => res.json({ status: 'ok' }));

  app.use('/api/v1', apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}


