import sqlite3 from 'sqlite3';

// Simple async queue around sqlite3 with fail-safe in-memory buffer
export class LogStorage {
  constructor(options) {
    this.sqliteFile = options.sqliteFile;
    this.retentionDays = options.retentionDays;
    this.fallbackMax = options.maxInMemoryFallback;
    this.queue = [];
    this.processing = false;
    this.inMemoryFallback = [];
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      sqlite3.verbose();
      this.db = new sqlite3.Database(this.sqliteFile, (err) => {
        if (err) return reject(err);
        this.db.serialize(() => {
          this.db.run(
            'CREATE TABLE IF NOT EXISTS logs (\n' +
              'id INTEGER PRIMARY KEY AUTOINCREMENT,\n' +
              'timestamp INTEGER NOT NULL,\n' +
              'method TEXT,\n' +
              'url TEXT,\n' +
              'status INTEGER,\n' +
              'responseTimeMs INTEGER,\n' +
              'clientIp TEXT,\n' +
              'userAgent TEXT,\n' +
              'device TEXT,\n' +
              'browser TEXT\n' +
            ')'
          );
          this.db.run('CREATE INDEX IF NOT EXISTS idx_logs_ts ON logs(timestamp)');
          this.db.run('CREATE INDEX IF NOT EXISTS idx_logs_url ON logs(url)');
          this.db.run('CREATE INDEX IF NOT EXISTS idx_logs_status ON logs(status)');
          resolve();
        });
      });
    });
  }

  enqueueLog(log) {
    // Also keep a small fallback ring buffer in memory
    this.inMemoryFallback.push(log);
    if (this.inMemoryFallback.length > this.fallbackMax) {
      this.inMemoryFallback.shift();
    }

    this.queue.push(log);
    this._processQueue();
  }

  _processQueue() {
    if (this.processing) return;
    if (!this.db) return; // not ready yet
    this.processing = true;
    const runNext = () => {
      const next = this.queue.shift();
      if (!next) {
        this.processing = false;
        return;
      }
      const stmt = this.db.prepare(
        'INSERT INTO logs (timestamp, method, url, status, responseTimeMs, clientIp, userAgent, device, browser) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
      );
      stmt.run(
        next.timestamp,
        next.method,
        next.url,
        next.status,
        next.responseTimeMs,
        next.clientIp,
        next.userAgent,
        next.device,
        next.browser,
        (err) => {
          stmt.finalize();
          // Continue regardless of errors to avoid blocking the app
          runNext();
        }
      );
    };
    runNext();
  }

  async search({ query = '', status, method, url, ip, limit = 100, offset = 0, sinceTs, untilTs }) {
    const clauses = [];
    const params = [];
    if (query) {
      clauses.push('(url LIKE ? OR userAgent LIKE ? OR clientIp LIKE ?)');
      const like = `%${query}%`;
      params.push(like, like, like);
    }
    if (status) {
      clauses.push('status = ?');
      params.push(Number(status));
    }
    if (method) {
      clauses.push('method = ?');
      params.push(method);
    }
    if (url) {
      clauses.push('url LIKE ?');
      params.push(`%${url}%`);
    }
    if (ip) {
      clauses.push('clientIp = ?');
      params.push(ip);
    }
    if (sinceTs) {
      clauses.push('timestamp >= ?');
      params.push(Number(sinceTs));
    }
    if (untilTs) {
      clauses.push('timestamp <= ?');
      params.push(Number(untilTs));
    }
    const where = clauses.length ? `WHERE ${clauses.join(' AND ')}` : '';
    const sql = `SELECT * FROM logs ${where} ORDER BY id DESC LIMIT ? OFFSET ?`;
    params.push(Number(limit), Number(offset));
    return new Promise((resolve) => {
      if (!this.db) {
        // fallback to in-memory buffer search
        const filtered = this.inMemoryFallback.filter((l) => {
          if (query) {
            const like = query.toLowerCase();
            const matches = (l.url || '').toLowerCase().includes(like) || (l.userAgent || '').toLowerCase().includes(like) || (l.clientIp || '').toLowerCase().includes(like);
            if (!matches) return false;
          }
          if (status && l.status !== Number(status)) return false;
          if (method && l.method !== method) return false;
          if (url && !(l.url || '').includes(url)) return false;
          if (ip && l.clientIp !== ip) return false;
          if (sinceTs && l.timestamp < Number(sinceTs)) return false;
          if (untilTs && l.timestamp > Number(untilTs)) return false;
          return true;
        });
        resolve(filtered.slice(0, limit));
        return;
      }
      this.db.all(sql, params, (err, rows) => {
        if (err) return resolve([]);
        resolve(rows || []);
      });
    });
  }

  async aggregates({ windowMinutes = 5 } = {}) {
    const since = Date.now() - windowMinutes * 60 * 1000;
    const queries = {
      byStatus: `SELECT status, COUNT(*) as count FROM logs WHERE timestamp >= ? GROUP BY status`,
      byEndpoint: `SELECT url, COUNT(*) as count FROM logs WHERE timestamp >= ? GROUP BY url ORDER BY count DESC LIMIT 20`,
      latencyP50: `SELECT responseTimeMs FROM logs WHERE timestamp >= ? ORDER BY responseTimeMs`,
      byIp: `SELECT clientIp as ip, COUNT(*) as count FROM logs WHERE timestamp >= ? GROUP BY clientIp ORDER BY count DESC LIMIT 20`,
      errors: `SELECT COUNT(*) as count FROM logs WHERE timestamp >= ? AND status >= 400`,
      total: `SELECT COUNT(*) as count FROM logs WHERE timestamp >= ?`,
    };
    return new Promise((resolve) => {
      if (!this.db) {
        const subset = this.inMemoryFallback.filter((l) => l.timestamp >= since);
        const byStatus = Object.values(subset.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {})).map((v, i) => ({ status: Object.keys(subset.reduce((acc, l) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {}))[i], count: v }));
        const byEndpointMap = subset.reduce((acc, l) => { acc[l.url] = (acc[l.url] || 0) + 1; return acc; }, {});
        const byEndpoint = Object.entries(byEndpointMap).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([url, count])=>({ url, count }));
        const byIpMap = subset.reduce((acc, l) => { acc[l.clientIp] = (acc[l.clientIp] || 0) + 1; return acc; }, {});
        const byIp = Object.entries(byIpMap).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([ip, count])=>({ ip, count }));
        const sortedLatency = subset.map(l => l.responseTimeMs).sort((a,b)=>a-b);
        const p = (p) => sortedLatency.length ? sortedLatency[Math.floor(p/100 * (sortedLatency.length - 1))] : 0;
        resolve({ byStatus, byEndpoint, byIp, p50: p(50), p95: p(95), errors: subset.filter(l=>l.status>=400).length, total: subset.length });
        return;
      }
      const result = { byStatus: [], byEndpoint: [], latency: [], byIp: [], errors: 0, total: 0 };
      this.db.all(queries.byStatus, [since], (e1, r1) => {
        result.byStatus = e1 ? [] : r1;
        this.db.all(queries.byEndpoint, [since], (e2, r2) => {
          result.byEndpoint = e2 ? [] : r2;
          this.db.all(queries.byIp, [since], (e3, r3) => {
            result.byIp = e3 ? [] : r3;
            this.db.all(queries.errors, [since], (e4, r4) => {
              result.errors = e4 ? 0 : (r4?.[0]?.count || 0);
              this.db.all(queries.total, [since], (e5, r5) => {
                result.total = e5 ? 0 : (r5?.[0]?.count || 0);
                // latency percentiles: fetch all and compute
                this.db.all(queries.latencyP50, [since], (e6, r6) => {
                  const arr = e6 ? [] : (r6 || []).map(x => x.responseTimeMs).sort((a,b)=>a-b);
                  const p = (p) => arr.length ? arr[Math.floor(p/100 * (arr.length - 1))] : 0;
                  resolve({
                    byStatus: result.byStatus,
                    byEndpoint: result.byEndpoint,
                    byIp: result.byIp,
                    p50: p(50),
                    p95: p(95),
                    errors: result.errors,
                    total: result.total,
                  });
                });
              });
            });
          });
        });
      });
    });
  }

  pruneOld() {
    if (!this.db) return;
    const cutoff = Date.now() - this.retentionDays * 24 * 60 * 60 * 1000;
    this.db.run('DELETE FROM logs WHERE timestamp < ?', [cutoff]);
  }
}

