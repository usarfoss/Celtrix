import rateLimit from 'express-rate-limit';
import { env } from '../constant/env.constant';

const windowMs = Number(env.RATE_LIMIT_WINDOW_MINUTES) * 60 * 1000;

export const globalRateLimiter = rateLimit({
  windowMs,
  max: Number(env.RATE_LIMIT_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

export const sensitiveRateLimiter = rateLimit({
  windowMs,
  max: Number(env.RATE_LIMIT_SENSITIVE_MAX),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests to this endpoint, please try again later.',
  },
});


