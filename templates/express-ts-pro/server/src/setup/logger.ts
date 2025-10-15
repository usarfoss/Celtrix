import { createLogger, format, transports } from 'winston';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [new transports.Console()],
});

export function withRequestContext(req: Request, _res: Response, next: NextFunction) {
  (req as any).requestId = (req.headers['x-request-id'] as string) || uuid();
  next();
}


