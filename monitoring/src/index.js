import express from 'express';
import basicAuth from 'express-basic-auth';
import helmet from 'helmet';
import cors from 'cors';
import compression from 'compression';
import EventEmitter from 'events';

import { monitoringConfig } from './config.js';
import { LogStorage } from './storage.js';
import { createMonitoringMiddleware } from './middleware.js';
import { createSocket } from './socket.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function attachMonitoring(app, httpServer, userConfig = {}) {
  const cfg = { ...monitoringConfig, ...userConfig };
  const emitter = new EventEmitter();
  const storage = new LogStorage({
    sqliteFile: cfg.sqliteFile,
    retentionDays: cfg.retentionDays,
    maxInMemoryFallback: cfg.maxInMemoryFallback,
  });
  await storage.init().catch(() => {/* fallback only */});

  const sockets = createSocket({
    httpServer,
    namespace: cfg.socketNamespace,
    apiKey: cfg.apiKey,
    batchIntervalMs: cfg.batchIntervalMs,
    maxBatchSize: cfg.maxBatchSize,
  });

  // Bridge events to socket
  emitter.on('logs', (batch) => sockets.push(batch));

  // Monitoring middleware
  const mw = createMonitoringMiddleware({ storage, emitter, trustProxy: cfg.trustProxy });
  app.use(mw);

  // Secure Dashboard
  const users = {};
  users[cfg.basicAuthUser] = cfg.basicAuthPass;
  const authMiddleware = basicAuth({ users, challenge: true });

  const dashboardRouter = express.Router();
  dashboardRouter.use(helmet());
  dashboardRouter.use(compression());
  dashboardRouter.use(cors());
  dashboardRouter.use(express.json({ limit: '64kb' }));

  // Static files
  dashboardRouter.use(express.static(path.join(__dirname, '..', 'public')));

  // API endpoints for search and aggregates
  dashboardRouter.get('/api/logs', async (req, res) => {
    const { q, status, method, url, ip, limit, offset, sinceTs, untilTs } = req.query;
    const rows = await storage.search({
      query: q,
      status,
      method,
      url,
      ip,
      limit: Number(limit || 100),
      offset: Number(offset || 0),
      sinceTs,
      untilTs,
    }).catch(() => []);
    res.json({ data: rows });
  });

  dashboardRouter.get('/api/aggregates', async (req, res) => {
    const windowMinutes = Number(req.query.window || 5);
    const aggs = await storage.aggregates({ windowMinutes }).catch(() => ({ byStatus: [], byEndpoint: [], byIp: [], p50: 0, p95: 0, errors: 0, total: 0 }));
    res.json(aggs);
  });

  // Health for monitoring module
  dashboardRouter.get('/api/health', (req, res) => {
    res.json({ ok: true });
  });

  // Attach under configured path with basic auth
  app.use(cfg.dashboardPath, authMiddleware, dashboardRouter);

  // Retention pruning
  setInterval(() => storage.pruneOld(), 60 * 60 * 1000);

  return { storage, sockets };
}

// If run directly, start a minimal express app for demo
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const app = express();
  const server = app.listen(process.env.PORT || 8081, async () => {
    await attachMonitoring(app, server);
    app.get('/health', (req, res) => res.json({ ok: true }));
    // sample endpoint
    app.get('/demo', async (req, res) => {
      await new Promise(r => setTimeout(r, Math.random() * 400));
      res.send('demo ok');
    });
    console.log('Monitoring demo on port', server.address().port);
  });
}

