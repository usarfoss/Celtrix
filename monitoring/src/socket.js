import { Server } from 'socket.io';

export function createSocket({ httpServer, namespace = '/monitor', apiKey = '', batchIntervalMs = 500, maxBatchSize = 200 }) {
  const io = new Server(httpServer, {
    path: `${namespace}/socket.io`,
    serveClient: false,
    cors: { origin: true, credentials: true },
  });

  const nsp = io.of(namespace);

  nsp.use((socket, next) => {
    const provided = socket.handshake.auth?.apiKey || socket.handshake.query?.apiKey || socket.handshake.headers['x-monitoring-key'];
    if (!apiKey || provided === apiKey) return next();
    next(new Error('Unauthorized'));
  });

  nsp.on('connection', (socket) => {
    socket.emit('hello', { message: 'connected' });
  });

  let buffer = [];
  const flush = () => {
    if (buffer.length === 0) return;
    const batch = buffer.slice(0, maxBatchSize);
    buffer = buffer.slice(batch.length);
    nsp.emit('logs', batch);
  };
  const timer = setInterval(flush, batchIntervalMs);

  function push(logs) {
    if (!Array.isArray(logs)) logs = [logs];
    buffer.push(...logs);
    if (buffer.length >= maxBatchSize) flush();
  }

  function close() {
    clearInterval(timer);
    io.close();
  }

  return { io, nsp, push, close };
}

