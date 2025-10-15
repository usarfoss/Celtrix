import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './constant/env.constant';
import { UserRoutes } from './api/user/v1/user.routes';
import { requestLogger } from './middlewares/requestLogger.middleware';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import { errorHandler } from './middlewares/errorHandler.middleware';
import logger from './utils/logger';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);
if (env.RATE_LIMIT_ENABLED) {
  app.use(globalRateLimiter);
}

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Api is working fine',
    status: 'success',
  });
});

app.use('/api/v1', UserRoutes);

// Global error handler last
app.use(errorHandler);

export default app;
