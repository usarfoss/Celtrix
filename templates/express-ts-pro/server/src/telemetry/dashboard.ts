import { Router } from 'express';
import { authenticate, requireRoles } from '../system/auth';
import { MonitoringHub } from './monitoringHub';

export const dashboardRouter = Router();

dashboardRouter.get('/events', authenticate, requireRoles('admin'), (_req, res) => {
  res.json({ events: MonitoringHub.getRecent() });
});

dashboardRouter.get('/', authenticate, requireRoles('admin'), (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send(`<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Realtime Monitoring</title>
  <style>
    body { font-family: sans-serif; margin: 16px; }
    #events { height: 60vh; overflow: auto; border: 1px solid #ddd; padding: 8px; }
    .row { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size: 12px; }
  </style>
  <script src="https://cdn.socket.io/4.7.2/socket.io.min.js"></script>
  <script>
    document.addEventListener('DOMContentLoaded', async () => {
      const container = document.getElementById('events');
      const token = localStorage.getItem('token') || '';
      const resp = await fetch('./events', { headers: { 'Authorization': 'Bearer ' + token }});
      const data = await resp.json();
      data.events.forEach(ev => add(ev));
      const socket = io();
      socket.on('http_request', add);
      function add(ev) {
        const div = document.createElement('div');
        div.className = 'row';
        div.textContent = JSON.stringify(ev);
        container.prepend(div);
      }
    });
  </script>
  </head>
  <body>
    <h2>Real-time API Monitor</h2>
    <div id="events"></div>
  </body>
  </html>`);
});


