import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

let mainWindow: BrowserWindow | null = null;

const isDev = process.env.NODE_ENV === 'development';

// ============================
// CONFIGURACIÓN AUTO-UPDATER
// ============================
autoUpdater.autoDownload = false; // Usuario decide cuándo descargar
autoUpdater.autoInstallOnAppQuit = true;

// Logs para debugging
autoUpdater.logger = {
  info: (msg) => console.log('[AutoUpdater]', msg),
  warn: (msg) => console.warn('[AutoUpdater]', msg),
  error: (msg) => console.error('[AutoUpdater]', msg),
  debug: (msg) => console.debug('[AutoUpdater]', msg),
};

// ============================
// FUNCIONES PARA MACHINE ID
// ============================
function getMachineId(): string {
  const networkInterfaces = os.networkInterfaces();
  let macAddress = '';

  // Buscar primera MAC address válida
  Object.keys(networkInterfaces).forEach(key => {
    const iface = networkInterfaces[key]?.find(
      (item) => !item.internal && item.mac !== '00:00:00:00:00:00'
    );
    if (iface && !macAddress) {
      macAddress = iface.mac;
    }
  });

  // Combinar con hostname para más unicidad
  const hostname = os.hostname();
  const data = `${macAddress}-${hostname}`;
  
  // Generar hash SHA-256
  return crypto.createHash('sha256').update(data).digest('hex');
}

function getSystemInfo() {
  return {
    machineId: getMachineId(),
    hostname: os.hostname(),
    osVersion: `${os.type()} ${os.release()}`,
    cpuModel: os.cpus()[0]?.model || 'Unknown',
    platform: os.platform()
  };
}

// ============================
// IPC HANDLERS
// ============================

// Para licencias
ipcMain.handle('get-machine-id', () => {
  return getMachineId();
});

ipcMain.handle('get-system-info', () => {
  return getSystemInfo();
});

// Para auto-updater
ipcMain.on('check-for-updates', () => {
  if (!isDev) {
    console.log('🔍 Verificando actualizaciones...');
    autoUpdater.checkForUpdates();
  }
});

ipcMain.on('download-update', () => {
  console.log('⬇️ Descargando actualización...');
  autoUpdater.downloadUpdate();
});

ipcMain.on('install-update', () => {
  console.log('🔄 Instalando actualización...');
  autoUpdater.quitAndInstall(false, true);
});

// ============================
// EVENTOS AUTO-UPDATER
// ============================
autoUpdater.on('checking-for-update', () => {
  console.log('🔍 Verificando actualizaciones...');
  mainWindow?.webContents.send('update-status', {
    status: 'checking',
    message: 'Buscando actualizaciones...'
  });
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Actualización disponible:', info.version);
  mainWindow?.webContents.send('update-status', {
    status: 'available',
    message: `Nueva versión ${info.version} disponible`,
    version: info.version
  });
});

autoUpdater.on('update-not-available', (info) => {
  console.log('ℹ️ No hay actualizaciones disponibles');
  mainWindow?.webContents.send('update-status', {
    status: 'not-available',
    message: 'La aplicación está actualizada'
  });
});

autoUpdater.on('download-progress', (progressObj) => {
  const message = `Descargando: ${Math.round(progressObj.percent)}%`;
  console.log(message);
  mainWindow?.webContents.send('update-status', {
    status: 'downloading',
    message,
    percent: progressObj.percent
  });
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Actualización descargada:', info.version);
  mainWindow?.webContents.send('update-status', {
    status: 'downloaded',
    message: 'Actualización lista para instalar',
    version: info.version
  });
});

autoUpdater.on('error', (error) => {
  console.error('❌ Error en auto-updater:', error);
  mainWindow?.webContents.send('update-status', {
    status: 'error',
    message: 'Error al verificar actualizaciones',
    error: error.message
  });
});

// ============================
// CREAR VENTANA
// ============================
// La función ya no necesita ser 'async' porque no espera a un servidor.
function createWindow() {

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    title: 'Barbería App',
    icon: path.join(__dirname, '../build/icon.png'),
  });

  // Cargar la app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Verificar actualizaciones cuando la ventana esté lista
  mainWindow.once('ready-to-show', () => {
    if (!isDev) {
      console.log('🚀 Verificando actualizaciones al iniciar...');
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000); // Esperar 3 segundos para que la app cargue
    }
  });
}

// ============================
// CICLO DE VIDA DE LA APP
// ============================
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
