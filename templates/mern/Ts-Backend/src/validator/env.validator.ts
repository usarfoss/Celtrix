import { z } from 'zod';

export const EnvSchema = z.object({
  PORT: z.string().default('5000'),
  HOST: z.string().default('localhost'),

  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  TRUST_PROXY: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  CORS_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  RATE_LIMIT_ENABLED: z
    .string()
    .default('true')
    .transform((v) => v === 'true'),
  RATE_LIMIT_WINDOW_MINUTES: z.string().default('15'),
  RATE_LIMIT_MAX: z.string().default('100'),
  RATE_LIMIT_SENSITIVE_MAX: z.string().default('10'),

  CLIENT_URL: z.string().url().default('http://localhost:5137'),

  JWT_SECRET: z.string().min(1, "JWT_SECRET is required"),
  JWT_EXPIRATION: z.string().default('7d'),
  JWT_ISSUER: z.string().default('app'),
  JWT_AUDIENCE: z.string().default('app-users'),
  
  DB_NAME: z.string().min(1, "DB_NAME is required"),
  DB_CONNECTION_STRING: z.string().min(1, "DB_CONNECTION_STRING is required"),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional().default(''),
  
  UPLOAD_DIR: z.string().default('./uploads'),
  TEMP_DIR: z.string().default('./temp'),
  MAX_FILE_SIZE: z.string()
    .regex(/^\d+[kmgt]?b$/i, "MAX_FILE_SIZE must be in format like '10mb', '1gb'")
    .default('10mb'),

  // Email (Nodemailer)
  MAIL_HOST: z.string().optional(),
  MAIL_PORT: z.string().optional(),
  MAIL_SECURE: z
    .string()
    .optional()
    .transform((v) => (v ? v === 'true' : undefined)),
  MAIL_USER: z.string().optional(),
  MAIL_PASSWORD: z.string().optional(),
  MAIL_FROM: z.string().optional(),

  // Twilio (SMS/WhatsApp)
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  TWILIO_SMS_FROM: z.string().optional(),
  TWILIO_WHATSAPP_FROM: z.string().optional(),

  // Telegram
  TELEGRAM_BOT_TOKEN: z.string().optional(),
  TELEGRAM_CHAT_ID: z.string().optional(),

  // Slack
  SLACK_WEBHOOK_URL: z.string().optional(),

  // Discord
  DISCORD_WEBHOOK_URL: z.string().optional(),
});