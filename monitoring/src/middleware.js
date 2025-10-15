import UAParser from 'ua-parser-js';
import { shouldRedactUrl, isHeaderRedacted, scrubUrl } from './config.js';

export function createMonitoringMiddleware({ storage, emitter, trustProxy = true }) {
  return function monitoringMiddleware(req, res, next) {
    if (trustProxy) {
      // let Express trust X-Forwarded-* for IP extraction
      req.app && req.app.set && req.app.set('trust proxy', 1);
    }
    const start = process.hrtime.bigint();
    const parser = new UAParser(req.headers['user-agent'] || '');
    const originalUrl = req.originalUrl || req.url;
    const urlPath = shouldRedactUrl(originalUrl) ? '[REDACTED]' : scrubUrl(originalUrl);
    const clientIp = (req.headers['x-forwarded-for'] || '').toString().split(',')[0].trim() || req.ip || req.socket?.remoteAddress || '';

    function onFinish() {
      res.removeListener('finish', onFinish);
      res.removeListener('close', onFinish);
      const end = process.hrtime.bigint();
      const responseTimeMs = Number((end - start) / 1000000n);
      const log = {
        timestamp: Date.now(),
        method: req.method,
        url: urlPath,
        status: res.statusCode,
        responseTimeMs,
        clientIp,
        userAgent: req.headers['user-agent'] || '',
        device: parser.getDevice()?.type || 'desktop',
        browser: parser.getBrowser()?.name || '',
      };
      try { storage.enqueueLog(log); } catch (e) {}
      try { emitter.emit('logs', [log]); } catch (e) {}
    }

    res.on('finish', onFinish);
    res.on('close', onFinish);
    next();
  };
}

