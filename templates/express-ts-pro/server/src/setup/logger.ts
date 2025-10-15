import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';
import { v4 as uuid } from 'uuid';
import { Request, Response, NextFunction } from 'express';

const logDir = path.join(process.cwd(), 'src', 'log');
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });

export const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ level, message, timestamp, ...meta }) => {
          return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta) : ''}`;
        })
      )
    }),
    new transports.File({ filename: path.join(logDir, 'error.log'), level: 'error' }),
    new transports.File({ filename: path.join(logDir, 'warning.log'), level: 'warn' }),
    new transports.File({ filename: path.join(logDir, 'success.log'), level: 'info' })
  ],
});

export function withRequestContext(req: Request, _res: Response, next: NextFunction) {
  (req as any).requestId = (req.headers['x-request-id'] as string) || uuid();
  next();
}


