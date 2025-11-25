import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';
import crypto from 'crypto';
import express from 'express';
import http from 'http';

let mainWindow: BrowserWindow | null = null;
let localServer: http.Server | null = null;
const LOCAL_PORT = 3456; // Puerto para el servidor local en producción

const isDev = process.env.NODE_ENV === 'development';

// ============================
// CONFIGURACIÓN AUTO-UPDATER
// ============================
autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = true;

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

  Object.keys(networkInterfaces).forEach(key => {
    const iface = networkInterfaces[key]?.find(
      (item) => !item.internal && item.mac !== '00:00:00:00:00:00'
    );
    if (iface && !macAddress) {
      macAddress = iface.mac;
    }
  });

  const hostname = os.hostname();
  const data = `${macAddress}-${hostname}`;
  
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
ipcMain.handle('get-machine-id', () => {
  return getMachineId();
});

ipcMain.handle('get-system-info', () => {
  return getSystemInfo();
});

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
// SERVIDOR LOCAL PARA PRODUCCIÓN
// ============================
async function startLocalServer(): Promise<number> {
  return new Promise((resolve, reject) => {
    const expressApp = express();
    const distPath = path.join(__dirname, '../dist');
    
    console.log('🌐 Iniciando servidor local...');
    console.log('📂 Sirviendo desde:', distPath);
    
    // Configurar middleware para servir archivos estáticos
    expressApp.use(express.static(distPath, {
      setHeaders: (res, filePath) => {
        // Configurar headers correctos para diferentes tipos de archivos
        if (filePath.endsWith('.js')) {
          res.setHeader('Content-Type', 'application/javascript');
        } else if (filePath.endsWith('.css')) {
          res.setHeader('Content-Type', 'text/css');
        } else if (filePath.endsWith('.html')) {
          res.setHeader('Content-Type', 'text/html');
        }
      }
    }));
    
    // Fallback para SPA routing - siempre devolver index.html
    expressApp.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    
    // Crear servidor HTTP
    localServer = http.createServer(expressApp);
    
    // Intentar iniciar en el puerto especificado
    localServer.listen(LOCAL_PORT, 'localhost', () => {
      console.log(`✅ Servidor local iniciado en http://localhost:${LOCAL_PORT}`);
      resolve(LOCAL_PORT);
    });
    
    localServer.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Puerto ${LOCAL_PORT} ya está en uso`);
        // Intentar con puerto aleatorio
        localServer = http.createServer(expressApp);
        localServer.listen(0, 'localhost', () => {
          const address = localServer?.address();
          if (address && typeof address === 'object') {
            console.log(`✅ Servidor local iniciado en puerto aleatorio: ${address.port}`);
            resolve(address.port);
          }
        });
      } else {
        reject(error);
      }
    });
  });
}

// ============================
// CREAR VENTANA
// ============================
async function createWindow() {
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
    show: false,
  });

  // ============================
  // CARGAR LA APP
  // ============================
  if (isDev) {
    // Desarrollo: Vite dev server
    console.log('🔧 Modo desarrollo');
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    // 🚀 PRODUCCIÓN: Servidor local
    try {
      const port = await startLocalServer();
      const url = `http://localhost:${port}`;
      
      console.log('📦 Modo producción con servidor local');
      console.log('🌐 Cargando desde:', url);
      
      await mainWindow.loadURL(url);
    } catch (error) {
      console.error('❌ Error iniciando servidor local:', error);
      // Fallback: intentar cargar desde archivos
      const indexPath = path.join(__dirname, '../dist/index.html');
      console.log('⚠️ Fallback: cargando desde archivo:', indexPath);
      await mainWindow.loadFile(indexPath);
    }
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    console.log('✅ Ventana lista para mostrar');
    mainWindow?.show();
    
    // Verificar actualizaciones después de 3 segundos
    if (!isDev) {
      console.log('🚀 Programando verificación de actualizaciones...');
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000);
    }
  });

  // Debug: Capturar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ Fallo al cargar:');
    console.error('   URL:', validatedURL);
    console.error('   Error:', errorCode, '-', errorDescription);
  });

  // Debug: Ver mensajes de consola del frontend
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['verbose', 'info', 'warning', 'error'];
    console.log(`[Frontend ${levels[level]}]:`, message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ============================
// CICLO DE VIDA DE LA APP
// ============================
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // Cerrar el servidor local si existe
  if (localServer) {
    console.log('🛑 Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Limpiar servidor al salir
app.on('before-quit', () => {
  if (localServer) {
    console.log('🛑 Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
});