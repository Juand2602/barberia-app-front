import { app, ipcMain, shell } from 'electron';
import { autoUpdater } from 'electron-updater';
import path from 'path';
import os from 'os';
import crypto from 'crypto';

// ============================
// 🔧 IMPORTAR EXPRESS CON REQUIRE
// ============================
const express = require('express');
const http = require('http');

let localServer: any = null;
const LOCAL_PORT = 3456;

const isDev = process.env.NODE_ENV === 'development';

// ============================
// LOG INICIAL
// ============================
console.log('=================================');
console.log('🚀 BARBERÍA APP INICIANDO');
console.log('🔍 Modo:', isDev ? 'DESARROLLO' : 'PRODUCCIÓN');
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
});

autoUpdater.on('update-available', (info) => {
  console.log('✅ Actualización disponible:', info.version);
});

autoUpdater.on('update-not-available', (info) => {
  console.log('ℹ️ No hay actualizaciones disponibles');
});

autoUpdater.on('download-progress', (progressObj) => {
  console.log(`Descargando: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Actualización descargada:', info.version);
});

autoUpdater.on('error', (error) => {
  console.error('❌ Error en auto-updater:', error);
});

// ============================
// SERVIDOR LOCAL
// ============================
async function startLocalServer(): Promise<number> {
  console.log('🌐 Iniciando servidor local...');
  
  return new Promise((resolve, reject) => {
    try {
      const expressApp = express();
      const distPath = path.join(__dirname, '../dist');
      
      console.log('📂 Ruta dist:', distPath);
      
      const fs = require('fs');
      if (!fs.existsSync(distPath)) {
        console.error('❌ Directorio dist NO existe');
        reject(new Error('Directorio dist no encontrado'));
        return;
      }
      
      console.log('✅ Directorio dist existe');
      
      // Configurar middleware
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
      
      // SPA routing fallback
      expressApp.get('*', (req: any, res: any) => {
        res.sendFile(path.join(distPath, 'index.html'));
      });
      
      // Crear servidor HTTP
      localServer = http.createServer(expressApp);
      
      // Intentar iniciar en el puerto especificado
      console.log(`🌐 Intentando iniciar en puerto ${LOCAL_PORT}...`);
      localServer.listen(LOCAL_PORT, 'localhost', () => {
        console.log('✅ ========================================');
        console.log(`✅ SERVIDOR LOCAL INICIADO`);
        console.log(`✅ URL: http://localhost:${LOCAL_PORT}`);
        console.log('✅ ========================================');
        resolve(LOCAL_PORT);
      });
      
      localServer.on('error', (error: any) => {
        console.error('❌ Error del servidor:', error);
        if (error.code === 'EADDRINUSE') {
          console.log(`⚠️ Puerto ${LOCAL_PORT} ocupado, intentando puerto aleatorio...`);
          localServer = http.createServer(expressApp);
          localServer.listen(0, 'localhost', () => {
            const address = localServer?.address();
            if (address && typeof address === 'object') {
              console.log(`✅ Servidor iniciado en puerto: ${address.port}`);
              resolve(address.port);
            }
          });
        } else {
          reject(error);
        }
      });
      
    } catch (error) {
      console.error('❌ Error en startLocalServer:', error);
      reject(error);
    }
  });
}

// ============================
// ABRIR EN NAVEGADOR
// ============================
async function openInBrowser() {
  console.log('🌐 [openInBrowser] Iniciando...');
  
  try {
    // Iniciar servidor
    const port = await startLocalServer();
    const url = `http://localhost:${port}`;
    
    console.log('🌐 [openInBrowser] Abriendo navegador...');
    console.log('🌐 [openInBrowser] URL:', url);
    
    // Abrir en el navegador predeterminado
    await shell.openExternal(url);
    
    console.log('✅ [openInBrowser] Navegador abierto exitosamente');
    
    // Verificar actualizaciones después de 3 segundos
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000);
    }
    
  } catch (error) {
    console.error('❌ [openInBrowser] Error:', error);
  }
}

// ============================
// CICLO DE VIDA DE LA APP
// ============================
app.whenReady().then(() => {
  console.log('✅ [App] Electron ready');
  
  if (isDev) {
    console.log('🔧 [App] Modo desarrollo - abrir http://localhost:5173 manualmente');
  } else {
    console.log('📦 [App] Modo producción - abriendo navegador...');
    openInBrowser();
  }
});

// Evitar que la app se cierre cuando no hay ventanas
// (necesario porque no abrimos ventanas de Electron)
app.on('window-all-closed', (e: any) => {
  // No hacer nada - mantener la app corriendo
  console.log('ℹ️ [App] No hay ventanas, pero la app sigue corriendo');
});

app.on('activate', () => {
  console.log('🔄 [App] Activate event');
  // En macOS, reabrir el navegador si se hace click en el dock
  if (localServer && process.platform === 'darwin') {
    const address = localServer.address();
    if (address && typeof address === 'object') {
      shell.openExternal(`http://localhost:${address.port}`);
    }
  }
});

// Limpiar servidor al salir
app.on('before-quit', () => {
  console.log('🛑 [App] Cerrando aplicación...');
  if (localServer) {
    console.log('🛑 [App] Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
});

// Permitir cerrar la app con Ctrl+C en consola
process.on('SIGINT', () => {
  console.log('🛑 [App] SIGINT recibido, cerrando...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('🛑 [App] SIGTERM recibido, cerrando...');
  app.quit();
});

console.log('✅ main.ts cargado completamente');