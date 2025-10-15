import 'dotenv/config';
import { createApp } from './app';
import { logger } from './setup/logger';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { MonitoringHub } from './telemetry/monitoringHub';

const app = createApp();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*' } });
MonitoringHub.attach(io);

const port = Number(process.env.PORT) || 4000;
const server = httpServer.listen(port, () => {
  logger.info('server_started', { port, env: process.env.NODE_ENV || 'development' });
});

process.on('unhandledRejection', (reason: any) => {
  logger.error('unhandled_rejection', { reason: reason?.message || String(reason) });
});

process.on('uncaughtException', (err) => {
  logger.error('uncaught_exception', { message: err.message, stack: err.stack });
  server.close(() => process.exit(1));
});


