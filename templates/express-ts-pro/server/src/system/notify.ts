import { Router } from 'express';
import nodemailer from 'nodemailer';

export const router = Router();

const transporter = nodemailer.createTransport({
  host: process.env.NOTIFY_SMTP_HOST,
  port: Number(process.env.NOTIFY_SMTP_PORT || 587),
  secure: false,
  auth: process.env.NOTIFY_SMTP_USER
    ? { user: process.env.NOTIFY_SMTP_USER, pass: process.env.NOTIFY_SMTP_PASS }
    : undefined,
});

router.post('/email', async (req, res, next) => {
  try {
    const { to, subject, text, html } = req.body || {};
    if (!to || !subject || (!text && !html)) {
      return res.status(400).json({ error: 'to, subject, and text|html are required' });
    }
    const from = process.env.NOTIFY_FROM || 'no-reply@example.com';
    const info = await transporter.sendMail({ from, to, subject, text, html });
    res.json({ messageId: info.messageId });
  } catch (e) {
    next(e);
  }
});


