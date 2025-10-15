import fs from 'fs';
import path from 'path';
import winston, { format } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

const logsDir = path.resolve(process.cwd(), 'src', 'log');

function ensureLogsDir(): void {
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
}

ensureLogsDir();

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp, ...meta }) => {
    const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} [${level}]: ${message}${metaString}`;
  }),
);

const fileFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.json(),
);

const errorFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'error',
  zippedArchive: true,
  maxFiles: '30d',
  format: fileFormat,
});

const warnFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'warning-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'warn',
  zippedArchive: true,
  maxFiles: '30d',
  format: fileFormat,
});

const infoFileTransport = new DailyRotateFile({
  dirname: logsDir,
  filename: 'success-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  level: 'info',
  zippedArchive: true,
  maxFiles: '30d',
  format: fileFormat,
});

export const logger = winston.createLogger({
  level: 'info',
  transports: [errorFileTransport, warnFileTransport, infoFileTransport],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
      level: 'debug',
    }),
  );
}

export default logger;


