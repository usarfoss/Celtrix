import { NextFunction, Request, Response } from 'express';
import onFinished from 'on-finished';
import logger from '../utils/logger';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startHrTime = process.hrtime.bigint();
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '';
  const userAgent = req.get('user-agent') || '';

  onFinished(res, () => {
    const endHrTime = process.hrtime.bigint();
    const elapsedMs = Number(endHrTime - startHrTime) / 1_000_000;
    const logPayload = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      responseTimeMs: Math.round(elapsedMs),
      ip,
      userAgent,
    };

    if (res.statusCode >= 500) {
      logger.error('HTTP', logPayload);
    } else if (res.statusCode >= 400) {
      logger.warn('HTTP', logPayload);
    } else {
      logger.info('HTTP', logPayload);
    }
  });

  next();
}


