import axios from 'axios';
import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { env } from '../constant/env.constant';
import logger from './logger';

export type NotificationChannel = 'email' | 'sms' | 'whatsapp' | 'telegram' | 'slack' | 'discord';

export type NotificationPayload = {
  to?: string; // email or phone
  subject?: string;
  text?: string;
  html?: string;
  channel: NotificationChannel;
};

const mailTransport = (() => {
  if (!env.MAIL_HOST || !env.MAIL_PORT || !env.MAIL_USER || !env.MAIL_PASSWORD) return null;
  return nodemailer.createTransport({
    host: env.MAIL_HOST,
    port: Number(env.MAIL_PORT),
    secure: Boolean(env.MAIL_SECURE),
    auth: { user: env.MAIL_USER, pass: env.MAIL_PASSWORD },
  });
})();

const twilioClient = (() => {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN) return null;
  return new Twilio(env.TWILIO_ACCOUNT_SID, env.TWILIO_AUTH_TOKEN);
})();

export async function sendNotification(payload: NotificationPayload): Promise<{ success: boolean; id?: string }>{
  try {
    switch (payload.channel) {
      case 'email': {
        if (!mailTransport) throw new Error('Mail transport not configured');
        const info = await mailTransport.sendMail({
          from: env.MAIL_FROM || env.MAIL_USER,
          to: payload.to,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
        });
        logger.info('Email sent', { id: info.messageId });
        return { success: true, id: info.messageId };
      }
      case 'sms': {
        if (!twilioClient || !env.TWILIO_SMS_FROM) throw new Error('Twilio SMS not configured');
        const msg = await twilioClient.messages.create({
          to: payload.to as string,
          from: env.TWILIO_SMS_FROM,
          body: payload.text,
        });
        logger.info('SMS sent', { sid: msg.sid });
        return { success: true, id: msg.sid };
      }
      case 'whatsapp': {
        if (!twilioClient || !env.TWILIO_WHATSAPP_FROM) throw new Error('Twilio WhatsApp not configured');
        const msg = await twilioClient.messages.create({
          to: `whatsapp:${payload.to}`,
          from: env.TWILIO_WHATSAPP_FROM,
          body: payload.text,
        });
        logger.info('WhatsApp sent', { sid: msg.sid });
        return { success: true, id: msg.sid };
      }
      case 'telegram': {
        if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) throw new Error('Telegram not configured');
        const url = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;
        const resp = await axios.post(url, { chat_id: env.TELEGRAM_CHAT_ID, text: payload.text, parse_mode: 'HTML' });
        logger.info('Telegram sent', { ok: resp.data.ok });
        return { success: true };
      }
      case 'slack': {
        if (!env.SLACK_WEBHOOK_URL) throw new Error('Slack webhook not configured');
        const resp = await axios.post(env.SLACK_WEBHOOK_URL, { text: payload.text });
        logger.info('Slack sent', { status: resp.status });
        return { success: resp.status >= 200 && resp.status < 300 };
      }
      case 'discord': {
        if (!env.DISCORD_WEBHOOK_URL) throw new Error('Discord webhook not configured');
        const resp = await axios.post(env.DISCORD_WEBHOOK_URL, { content: payload.text });
        logger.info('Discord sent', { status: resp.status });
        return { success: resp.status >= 200 && resp.status < 300 };
      }
      default:
        throw new Error('Unsupported channel');
    }
  } catch (error) {
    logger.error('Notification error', { error: (error as Error).message });
    return { success: false };
  }
}


