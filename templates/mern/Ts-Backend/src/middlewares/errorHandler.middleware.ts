import { NextFunction, Request, Response } from 'express';
import logger from '../utils/logger';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction): void {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const details = err.details || undefined;

  logger.error('Unhandled error', {
    status,
    message,
    details,
    path: req.originalUrl,
    method: req.method,
  });

  res.status(status).json({ status: 'error', message, details });
}


