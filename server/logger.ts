import fs from 'fs';
import path from 'path';

let logDir: string;
let appLogPath: string;
let errorLogPath: string;

function initLogPaths() {
  // Determine standard user data path or relative fallback
  if (process.env.APPDATA) {
    logDir = path.join(process.env.APPDATA, 'botflow-studio-pro', 'logs');
  } else if (process.env.HOME) {
    logDir = path.join(process.env.HOME, '.botflow-studio-pro', 'logs');
  } else {
    logDir = path.join(process.cwd(), 'logs');
  }

  try {
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  } catch {
    logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
  }

  appLogPath = path.join(logDir, 'app.log');
  errorLogPath = path.join(logDir, 'error.log');
}

initLogPaths();

function formatMessage(level: string, message: any[]): string {
  const timestamp = new Date().toISOString();
  const formattedMsg = message
    .map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    })
    .join(' ');

  return `[${timestamp}] [${level}] ${formattedMsg}\n`;
}

function writeToFile(filePath: string, text: string) {
  try {
    // Truncate log file if it exceeds 10MB to prevent huge disk usage
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 10 * 1024 * 1024) {
        fs.writeFileSync(filePath, `--- LOG TRUNCATED (${new Date().toISOString()}) ---\n`);
      }
    }
    fs.appendFileSync(filePath, text, 'utf8');
  } catch (err) {
    // Fallback ignore if disk is read-only
  }
}

// Override console methods to write logs to disk
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleInfo = console.info;

console.log = function (...args: any[]) {
  originalConsoleLog.apply(console, args);
  writeToFile(appLogPath, formatMessage('INFO', args));
};

console.info = function (...args: any[]) {
  originalConsoleInfo.apply(console, args);
  writeToFile(appLogPath, formatMessage('INFO', args));
};

console.warn = function (...args: any[]) {
  originalConsoleWarn.apply(console, args);
  const formatted = formatMessage('WARN', args);
  writeToFile(appLogPath, formatted);
  writeToFile(errorLogPath, formatted);
};

console.error = function (...args: any[]) {
  originalConsoleError.apply(console, args);
  const formatted = formatMessage('ERROR', args);
  writeToFile(appLogPath, formatted);
  writeToFile(errorLogPath, formatted);
};

// Capture global unhandled exceptions and rejections
process.on('uncaughtException', (err) => {
  const msg = `[CRASH] Uncaught Exception: ${err?.stack || err}`;
  originalConsoleError(msg);
  writeToFile(appLogPath, formatMessage('FATAL', [msg]));
  writeToFile(errorLogPath, formatMessage('FATAL', [msg]));
});

process.on('unhandledRejection', (reason) => {
  const msg = `[REJECTION] Unhandled Rejection: ${reason instanceof Error ? reason.stack : String(reason)}`;
  originalConsoleError(msg);
  writeToFile(appLogPath, formatMessage('ERROR', [msg]));
  writeToFile(errorLogPath, formatMessage('ERROR', [msg]));
});

export function getLogDirectory(): string {
  return logDir;
}

export function getAppLogFilePath(): string {
  return appLogPath;
}

export function getErrorLogFilePath(): string {
  return errorLogPath;
}

export function readAppLogs(maxLines = 500): { content: string; path: string; errorPath: string } {
  try {
    if (!fs.existsSync(appLogPath)) {
      return { content: 'Nenhum log registrado ainda.', path: appLogPath, errorPath: errorLogPath };
    }
    const raw = fs.readFileSync(appLogPath, 'utf8');
    const lines = raw.split('\n');
    const sliced = lines.length > maxLines ? lines.slice(lines.length - maxLines) : lines;
    return { content: sliced.join('\n'), path: appLogPath, errorPath: errorLogPath };
  } catch (err: any) {
    return { content: `Erro ao ler logs: ${err.message}`, path: appLogPath, errorPath: errorLogPath };
  }
}

export function clearAppLogs(): boolean {
  try {
    if (fs.existsSync(appLogPath)) fs.writeFileSync(appLogPath, '');
    if (fs.existsSync(errorLogPath)) fs.writeFileSync(errorLogPath, '');
    console.log('[Logger] Arquivos de log limpos pelo usuário.');
    return true;
  } catch {
    return false;
  }
}
