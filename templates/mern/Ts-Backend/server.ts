import { server } from './src/config/socket.config';
import { env } from './src/constant/env.constant';
import connectDB from './src/config/db.config';
import logger from './src/utils/logger';

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Promise Rejection', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', { error: error.message });
  process.exit(1);
});

server.listen(env.PORT, async () => {
  await connectDB();
  logger.info('Server started', {
    url: `http://${env.HOST}:${env.PORT}`,
    mode: env.NODE_ENV,
  });
});
