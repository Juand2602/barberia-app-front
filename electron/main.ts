import { app, BrowserWindow, ipcMain } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// ============================
// 🔧 IMPORTAR EXPRESS CON REQUIRE (más compatible)
// ============================
const express = require('express');
const http = require('http');

let mainWindow: BrowserWindow | null = null;
let localServer: any = null;
const LOCAL_PORT = 3456;

const isDev = process.env.NODE_ENV === 'development';

// ============================
// LOG INICIAL PARA DEBUG
// ============================
console.log('=================================');
console.log('🚀 BARBERÍA APP INICIANDO');
console.log('🔍 Modo:', isDev ? 'DESARROLLO' : 'PRODUCCIÓN');
console.log('🔍 Express disponible:', typeof express);
console.log('=================================');

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
  console.log('🌐 [startLocalServer] Función iniciada');
  
  return new Promise((resolve, reject) => {
    try {
      console.log('🌐 [startLocalServer] Creando app Express...');
      const expressApp = express();
      
      const distPath = path.join(__dirname, '../dist');
      console.log('📂 [startLocalServer] Ruta dist:', distPath);
      console.log('📂 [startLocalServer] __dirname:', __dirname);
      
      // Verificar que el directorio existe
      const fs = require('fs');
      if (!fs.existsSync(distPath)) {
        console.error('❌ [startLocalServer] Directorio dist NO existe:', distPath);
        reject(new Error('Directorio dist no encontrado'));
        return;
      }
      console.log('✅ [startLocalServer] Directorio dist existe');
      
      // Configurar middleware para servir archivos estáticos
      console.log('🔧 [startLocalServer] Configurando middleware...');
      expressApp.use(express.static(distPath, {
        setHeaders: (res: any, filePath: string) => {
          if (filePath.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
          } else if (filePath.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
          } else if (filePath.endsWith('.html')) {
            res.setHeader('Content-Type', 'text/html');
          }
        }
      }));
      
      // Fallback para SPA routing
      expressApp.get('*', (req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      
      console.log('🔧 [startLocalServer] Middleware configurado');
      
      // Crear servidor HTTP
      console.log('🌐 [startLocalServer] Creando servidor HTTP...');
      localServer = http.createServer(expressApp);
      
      // Intentar iniciar en el puerto especificado
      console.log(`🌐 [startLocalServer] Intentando iniciar en puerto ${LOCAL_PORT}...`);
      localServer.listen(LOCAL_PORT, 'localhost', () => {
        console.log('✅ ========================================');
        console.log(`✅ SERVIDOR LOCAL INICIADO EXITOSAMENTE`);
        console.log(`✅ URL: http://localhost:${LOCAL_PORT}`);
        console.log('✅ ========================================');
        resolve(LOCAL_PORT);
      });
      
      localServer.on('error', (error: any) => {
        console.error('❌ [startLocalServer] Error del servidor:', error);
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️ Puerto ${LOCAL_PORT} ocupado, intentando puerto aleatorio...`);
          // Intentar con puerto aleatorio
          localServer = http.createServer(expressApp);
          localServer.listen(0, 'localhost', () => {
            const address = localServer?.address();
            if (address && typeof address === 'object') {
              console.log(`✅ Servidor iniciado en puerto aleatorio: ${address.port}`);
              resolve(address.port);
            }
          });
        } else {
          reject(error);
        }
      });
      
    } catch (error) {
      console.error('❌ [startLocalServer] Error en try-catch:', error);
      reject(error);
    }
  });
}

// ============================
// CREAR VENTANA
// ============================
async function createWindow() {
  console.log('🪟 [createWindow] Iniciando creación de ventana...');
  console.log('🔍 [createWindow] isDev:', isDev);
  console.log('🔍 [createWindow] NODE_ENV:', process.env.NODE_ENV);
  
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

  console.log('✅ [createWindow] BrowserWindow creada');

  // ============================
  // CARGAR LA APP
  // ============================
  if (isDev) {
    console.log('🔧 [createWindow] Modo DESARROLLO');
    console.log('🌐 [createWindow] Cargando desde Vite: http://localhost:5173');
    await mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    console.log('📦 [createWindow] Modo PRODUCCIÓN');
    
    try {
      console.log('🚀 [createWindow] Llamando a startLocalServer()...');
      const port = await startLocalServer();
      const url = `http://localhost:${port}`;
      
      console.log('✅ [createWindow] Servidor iniciado exitosamente');
      console.log('🌐 [createWindow] Cargando desde:', url);
      
      await mainWindow.loadURL(url);
      
      // 🔧 ABRIR DEVTOOLS EN PRODUCCIÓN PARA DEBUG
      console.log('🔧 [createWindow] Abriendo DevTools para debugging...');
      mainWindow.webContents.openDevTools();
      
    } catch (error) {
      console.error('❌ [createWindow] Error iniciando servidor:', error);
      
      // Fallback a file://
      const indexPath = path.join(__dirname, '../dist/index.html');
      console.log('⚠️ [createWindow] FALLBACK: Cargando desde archivo:', indexPath);
      await mainWindow.loadFile(indexPath);
      
      // Abrir DevTools también en fallback
      mainWindow.webContents.openDevTools();
    }
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once('ready-to-show', () => {
    console.log('✅ [createWindow] Ventana lista para mostrar');
    mainWindow?.show();
    
    // Verificar actualizaciones después de 3 segundos
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000);
    }
  });

  // Debug: Capturar errores de carga
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('❌ [WebContents] Fallo al cargar:');
    console.error('   URL:', validatedURL);
    console.error('   Error:', errorCode, '-', errorDescription);
  });

  // Debug: Ver mensajes de consola del frontend
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    const levels = ['verbose', 'info', 'warning', 'error'];
    console.log(`[Frontend ${levels[level]}]:`, message);
  });

  mainWindow.on('closed', () => {
    console.log('🛑 [createWindow] Ventana cerrada');
    mainWindow = null;
  });
}

// ============================
// CICLO DE VIDA DE LA APP
// ============================
app.whenReady().then(() => {
  console.log('✅ [App] Electron ready, creando ventana...');
  createWindow();
});

app.on('window-all-closed', () => {
  console.log('🛑 [App] Todas las ventanas cerradas');
  
  // Cerrar el servidor local si existe
  if (localServer) {
    console.log('🛑 [App] Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
  
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  console.log('🔄 [App] Activate event');
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// Limpiar servidor al salir
app.on('before-quit', () => {
  console.log('🛑 [App] Before quit event');
  if (localServer) {
    console.log('🛑 [App] Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
});

console.log('✅ main.ts cargado completamente');