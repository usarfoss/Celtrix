import fs from 'fs';
import path from 'path';
import chalk from 'chalk';

class Logger {
  private logDir: string;

  constructor() {
    this.logDir = path.join(process.cwd(), 'src', 'log');
    this.ensureLogDirectory();
  }

  private ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  private getLogFileName(level: string): string {
    const date = new Date().toISOString().split('T')[0];
    return path.join(this.logDir, `${level}-${date}.log`);
  }

  private writeToFile(level: string, message: string, meta?: any) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      meta: meta || {}
    };

    const logString = JSON.stringify(logEntry) + '\n';
    
    try {
      fs.appendFileSync(this.getLogFileName(level), logString);
    } catch (error) {
      console.error('Failed to write log to file:', error);
    }
  }

  private formatConsoleMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    let coloredMessage = message;

    switch (level) {
      case 'error':
        coloredMessage = chalk.red(`[ERROR] ${message}`);
        break;
      case 'warn':
        coloredMessage = chalk.yellow(`[WARN] ${message}`);
        break;
      case 'info':
        coloredMessage = chalk.blue(`[INFO] ${message}`);
        break;
      default:
        coloredMessage = chalk.white(`[${level.toUpperCase()}] ${message}`);
    }

    return `[${timestamp}] ${coloredMessage}${meta ? ' ' + JSON.stringify(meta) : ''}`;
  }

  info(message: string, meta?: any) {
    const consoleMessage = this.formatConsoleMessage('info', message, meta);
    console.log(consoleMessage);
    this.writeToFile('success', message, meta);
  }

  warn(message: string, meta?: any) {
    const consoleMessage = this.formatConsoleMessage('warn', message, meta);
    console.warn(consoleMessage);
    this.writeToFile('warning', message, meta);
  }

  error(message: string, meta?: any) {
    const consoleMessage = this.formatConsoleMessage('error', message, meta);
    console.error(consoleMessage);
    this.writeToFile('error', message, meta);
  }
}

export const logger = new Logger();