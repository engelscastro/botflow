const { app, BrowserWindow, ipcMain, shell, Notification, Tray, Menu, globalShortcut } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let expressAppStarted = false;
let lastServerError = null;
let tray = null;

// Disable GPU Hardware Acceleration to prevent black screen on Windows 10/11 graphics cards
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('disable-gpu');
app.commandLine.appendSwitch('disable-software-rasterizer');

const PORT = process.env.PORT || 3000;
const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;

let boundServerPort = PORT;

function getAppIcon() {
  const appPath = app.getAppPath();
  const iconCandidates = [
    path.join(__dirname, '../public/icon.png'),
    path.join(__dirname, 'icon.png'),
    path.join(appPath, 'public/icon.png'),
    path.join(appPath, 'dist/icon.png'),
    path.join(appPath.replace('app.asar', 'app.asar.unpacked'), 'public/icon.png')
  ];
  for (const p of iconCandidates) {
    if (fs.existsSync(p)) return p;
  }
  return undefined;
}

async function startExpressServer() {
  if (isDev) {
    console.log('[Electron] Running in dev mode, relying on external Express/Vite server...');
    return boundServerPort;
  }

  if (expressAppStarted) return boundServerPort;

  process.env.NODE_ENV = 'production';
  process.env.PORT = PORT.toString();

  const appPath = app.getAppPath();
  
  // Resolve dist directory location
  let distDir = path.join(appPath, 'dist');
  const unpackedDistDir = distDir.replace('app.asar', 'app.asar.unpacked');
  if (fs.existsSync(path.join(unpackedDistDir, 'index.html'))) {
    distDir = unpackedDistDir;
  } else if (fs.existsSync(path.join(appPath, 'index.html'))) {
    distDir = appPath;
  }
  process.env.DIST_PATH = distDir;
  console.log('[Electron] Production DIST_PATH set to:', distDir);

  let serverPath = path.join(appPath, 'dist', 'server.cjs');
  const unpackedServerPath = serverPath.replace('app.asar', 'app.asar.unpacked');
  if (fs.existsSync(unpackedServerPath)) {
    serverPath = unpackedServerPath;
  }

  console.log('[Electron] Starting production Express server directly in main process:', serverPath);

  try {
    const serverModule = require(serverPath);
    const startServerFn = serverModule.startServer || (typeof serverModule === 'function' ? serverModule : null);

    if (typeof startServerFn === 'function') {
      boundServerPort = await startServerFn(PORT);
      expressAppStarted = true;
      console.log(`[Electron] Production Express server initialized and listening on port ${boundServerPort}.`);
    } else {
      console.log('[Electron] Server module loaded legacy CJS without export.');
      expressAppStarted = true;
    }
  } catch (err) {
    lastServerError = err?.stack || err?.message || String(err);
    console.error('[Electron] Failed to start production server:', err);
  }

  return boundServerPort;
}

async function createWindow() {
  const appIcon = getAppIcon();

  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 1024,
    minHeight: 700,
    title: 'BotFlow Studio v2.5 PRO',
    icon: appIcon,
    backgroundColor: '#050505',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      webSecurity: false // Disabled to allow direct HTTP API calls to local network Android Gateway without CORS/PNA restrictions
    }
  });

  mainWindow.setMenuBarVisibility(false);

  const activePort = await startExpressServer().catch(() => PORT);
  const serverUrl = `http://127.0.0.1:${activePort}`;

  // Retry loading until Express server is live
  const loadURLWithRetry = (url, retries = 20, delay = 1000) => {
    mainWindow.loadURL(url).then(() => {
      if (!mainWindow.isVisible()) {
        mainWindow.show();
      }
    }).catch((err) => {
      if (retries > 0) {
        console.log(`[Electron] Waiting for server on ${url} (${retries} retries left)...`);
        setTimeout(() => loadURLWithRetry(url, retries - 1, delay), delay);
      } else {
        console.error('[Electron] Failed to load server URL after retries:', err);
        mainWindow.show();
        const errDetails = lastServerError ? `<div style="background:#0a0a0c;color:#f87171;padding:12px;border-radius:8px;font-family:monospace;font-size:11px;text-align:left;white-space:pre-wrap;max-height:160px;overflow:auto;margin:12px 0;border:1px solid rgba(239,68,68,0.2);">${lastServerError}</div>` : '';
        mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`
          <!DOCTYPE html>
          <html>
            <head><title>BotFlow Studio PRO - Erro de Conexão</title></head>
            <body style="background-color:#050505;color:#ffffff;font-family:system-ui,-apple-system,sans-serif;display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;margin:0;padding:20px;text-align:center;">
              <div style="background:#141417;border:1px solid rgba(255,255,255,0.1);padding:32px;border-radius:16px;max-width:540px;box-shadow:0 20px 25px -5px rgba(0,0,0,0.5);">
                <h2 style="margin-top:0;color:#60a5fa;font-size:20px;">Falha ao Conectar ao Servidor Interno</h2>
                <p style="color:#94a3b8;font-size:14px;line-height:1.6;">O aplicativo não conseguiu estabelecer conexão com o servidor local em <strong>${url}</strong>.</p>
                ${errDetails}
                <button onclick="window.location.href='${url}'" style="margin-top:16px;background-color:#2563eb;color:#ffffff;font-weight:600;padding:10px 24px;border:none;border-radius:8px;cursor:pointer;font-size:14px;transition:background 0.2s;">
                  Tentar Novamente
                </button>
              </div>
            </body>
          </html>
        `)}`);
      }
    });
  };

  loadURLWithRetry(serverUrl);

  setTimeout(() => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
  }, 3500);

  mainWindow.once('ready-to-show', () => {
    if (mainWindow && !mainWindow.isVisible()) {
      mainWindow.show();
    }
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Intercept open target="_blank" links to open in external browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Single Instance Lock
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(async () => {
    await startExpressServer().catch((err) => {
      console.error('[Electron] startExpressServer failed on startup:', err);
    });
    await createWindow();

    // Allow pressing F12 or Ctrl+Shift+I / Cmd+Option+I to toggle DevTools if needed
    globalShortcut.register('F12', () => {
      if (mainWindow) mainWindow.webContents.toggleDevTools();
    });
    globalShortcut.register('CommandOrControl+Shift+I', () => {
      if (mainWindow) mainWindow.webContents.toggleDevTools();
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// IPC Handlers
ipcMain.handle('get-app-version', () => app.getVersion());
ipcMain.handle('get-is-electron', () => true);

ipcMain.handle('get-logs-path', () => {
  const logDir = process.env.APPDATA 
    ? path.join(process.env.APPDATA, 'botflow-studio-pro', 'logs')
    : path.join(app.getPath('userData'), 'logs');
  return path.join(logDir, 'app.log');
});

ipcMain.handle('open-logs-folder', () => {
  const logDir = process.env.APPDATA 
    ? path.join(process.env.APPDATA, 'botflow-studio-pro', 'logs')
    : path.join(app.getPath('userData'), 'logs');
  
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
  }
  shell.openPath(logDir);
  return logDir;
});

ipcMain.on('open-external-url', (event, url) => {
  if (url) shell.openExternal(url);
});

ipcMain.on('show-notification', (event, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title: title || 'BotFlow Studio', body: body || '' }).show();
  }
});

// App lifecycle cleanup
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
