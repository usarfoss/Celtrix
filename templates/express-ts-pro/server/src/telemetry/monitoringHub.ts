import { Server } from 'socket.io';

type HttpEvent = {
  method: string;
  path: string;
  status: number;
  durationMs: number;
  ip: string;
  ua?: { family?: string; os?: string; device?: string };
  timestamp: string;
};

export class MonitoringHub {
  private static io: Server | null = null;
  private static buffer: HttpEvent[] = [];
  private static maxBuffer = 1000;

  static attach(io: Server) {
    MonitoringHub.io = io;
  }

  static emitEvent(event: 'http_request', data: HttpEvent) {
    MonitoringHub.buffer.push(data);
    if (MonitoringHub.buffer.length > MonitoringHub.maxBuffer) MonitoringHub.buffer.shift();
    if (MonitoringHub.io) MonitoringHub.io.emit(event, data);
  }

  static getRecent(): HttpEvent[] {
    return MonitoringHub.buffer.slice(-200);
  }
}


