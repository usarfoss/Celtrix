Celtrix Monitoring
==================

Features
- Real-time request/response tracking (method, URL, status, latency, IP, UA, device, timestamp)
- Live dashboard with charts, search, filter, sorting (table headers in browser)
- Secure access via Basic Auth and optional Socket API key
- SQLite storage with in-memory fallback ring buffer
- Redaction of sensitive URL paths and query parameters
- Retention pruning and batched socket broadcasts

Quickstart
1. Install dependencies:
   - `npm install`
2. Run demo:
   - `npm start`
3. Open dashboard:
   - `http://localhost:8081/_monitor` (default `admin/admin`)

Environment Variables
- `MONITORING_DASHBOARD_PATH` default `/_monitor`
- `MONITORING_SOCKET_NAMESPACE` default `/monitor`
- `MONITORING_USER`, `MONITORING_PASS` default `admin/admin`
- `MONITORING_API_KEY` (optional) for Socket authentication
- `MONITORING_SQLITE_FILE` default `:memory:`
- `MONITORING_RETENTION_DAYS` default `7`
- `MONITORING_BATCH_INTERVAL_MS` default `500`
- `MONITORING_MAX_BATCH_SIZE` default `200`
- `MONITORING_REDACT_PATHS` default `/password,/token`
- `MONITORING_REDACT_HEADERS` default `authorization,cookie,set-cookie`
- `MONITORING_REDACT_QUERY_KEYS` default `password,pass,token,secret,apikey,api_key,authorization`
- `MONITORING_TRUST_PROXY` default `true`

Integrate with Express
```js
import http from 'http';
import express from 'express';
import { attachMonitoring } from './monitoring/src/index.js';

const app = express();
const server = http.createServer(app);

await attachMonitoring(app, server, {
  dashboardPath: '/_monitor',
  socketNamespace: '/monitor',
  basicAuthUser: 'admin',
  basicAuthPass: 'change-this',
  apiKey: process.env.MONITORING_API_KEY,
  sqliteFile: './monitor.sqlite',
  retentionDays: 7,
});

server.listen(3000);
```

Security & Privacy
- Basic Auth protects dashboard; rotate credentials regularly
- Optional Socket API key prompts in dashboard if required
- URLs containing configured sensitive path fragments are replaced with `[REDACTED]`
- Configured query parameter keys are replaced with `REDACTED`

Failure Modes
- If SQLite is unavailable, logs are still kept in a bounded in-memory buffer
- Logging never throws; request handling remains unaffected

Extensibility
- Add custom aggregations via `storage.aggregates`
- Forward logs to external systems by listening to the `emitter` used in `middleware`

