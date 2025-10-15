import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from './config';
import { requestLogger } from './middleware/requestLogger';
import { globalRateLimiter } from './middleware/rateLimit';
import { errorHandler } from './middleware/errorHandler';
import routes from './routes';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.cors.origins,
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (config.nodeEnv === 'development') {
  app.use(morgan('combined'));
}
app.use(requestLogger);

// Rate limiting
app.use(globalRateLimiter);

// Static files
app.use(express.static('public'));

// API routes
app.use('/api/v1', routes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;