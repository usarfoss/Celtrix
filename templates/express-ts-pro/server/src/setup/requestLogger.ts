import { Request, Response, NextFunction } from 'express';
import { logger } from './logger';
import useragent from 'useragent';
import { MonitoringHub } from '../telemetry/monitoringHub';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const start = Date.now();
  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const agent = useragent.parse(req.headers['user-agent'] || '');
    const payload = {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      durationMs,
      ip: req.ip,
      ua: {
        family: agent.family,
        os: agent.os?.toString(),
        device: agent.device?.toString()
      },
      timestamp: new Date().toISOString()
    };
    logger.info('http_request', payload);
    MonitoringHub.emitEvent('http_request', payload);
  });
  next();
}


