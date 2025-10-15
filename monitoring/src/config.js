import dotenv from 'dotenv';

dotenv.config();

export const monitoringConfig = {
  dashboardPath: process.env.MONITORING_DASHBOARD_PATH || '/_monitor',
  socketNamespace: process.env.MONITORING_SOCKET_NAMESPACE || '/monitor',
  apiKey: process.env.MONITORING_API_KEY || '',
  basicAuthUser: process.env.MONITORING_USER || 'admin',
  basicAuthPass: process.env.MONITORING_PASS || 'admin',
  sqliteFile: process.env.MONITORING_SQLITE_FILE || ':memory:',
  maxInMemoryFallback: Number(process.env.MONITORING_FALLBACK_MAX || 1000),
  batchIntervalMs: Number(process.env.MONITORING_BATCH_INTERVAL_MS || 500),
  maxBatchSize: Number(process.env.MONITORING_MAX_BATCH_SIZE || 200),
  redactPaths: (process.env.MONITORING_REDACT_PATHS || '/password,/token').split(',').map(s => s.trim()).filter(Boolean),
  redactHeaders: (process.env.MONITORING_REDACT_HEADERS || 'authorization,cookie,set-cookie').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  redactQueryKeys: (process.env.MONITORING_REDACT_QUERY_KEYS || 'password,pass,token,secret,apikey,api_key,authorization').split(',').map(s => s.trim().toLowerCase()).filter(Boolean),
  trustProxy: (process.env.MONITORING_TRUST_PROXY || 'true') === 'true',
  retentionDays: Number(process.env.MONITORING_RETENTION_DAYS || 7),
};

export function isHeaderRedacted(headerName, cfg = monitoringConfig) {
  if (!headerName) return false;
  return cfg.redactHeaders.includes(String(headerName).toLowerCase());
}

export function shouldRedactUrl(url, cfg = monitoringConfig) {
  if (!url) return false;
  return cfg.redactPaths.some(pathFrag => url.includes(pathFrag));
}

export function scrubUrl(url, cfg = monitoringConfig) {
  try {
    const u = new URL(url, 'http://local');
    const params = u.searchParams;
    cfg.redactQueryKeys.forEach((k) => {
      if (params.has(k)) params.set(k, 'REDACTED');
    });
    u.search = params.toString();
    const rebuilt = u.pathname + (u.search ? `?${u.search}` : '') + (u.hash || '');
    return rebuilt;
  } catch {
    return url;
  }
}

