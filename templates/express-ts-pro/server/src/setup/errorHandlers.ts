import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';

export function notFoundHandler(_req: Request, res: Response) {
  res.status(404).json({ error: 'Not found' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error('unhandled_error', { message: err?.message, stack: err?.stack });
  const status = typeof err?.status === 'number' ? err.status : 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}


