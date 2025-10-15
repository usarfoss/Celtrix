import app from './app';
import { config } from './config';
import { logger } from './utils/logger';

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', { reason, promise });
  process.exit(1);
});

// Start server
const server = app.listen(config.port, () => {
  logger.info(`🚀 Server running on port ${config.port}`);
  logger.info(`🌍 Environment: ${config.nodeEnv}`);
  logger.info(`📊 Health check: http://localhost:${config.port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('👋 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('💥 Process terminated!');
    process.exit(0);
  });
});