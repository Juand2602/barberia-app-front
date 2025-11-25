import { app, ipcMain, shell, Menu, Tray, nativeImage } from 'electron';
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
let tray: Tray | null = null;
let serverPort: number = 3456;
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
autoUpdater.on('update-available', (info) => {
  console.log('✅ Actualización disponible:', info.version);
  if (tray) {
    tray.setToolTip(`Barbería App - Actualización disponible: v${info.version}`);
  }
});

autoUpdater.on('update-downloaded', (info) => {
  console.log('✅ Actualización descargada:', info.version);
  if (tray) {
    tray.setToolTip('Barbería App - Actualización lista para instalar');
  }
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
// CREAR ICONO EN BANDEJA DEL SISTEMA
// ============================
function createTray(port: number) {
  console.log('🎨 Creando icono en bandeja del sistema...');
  
  // Intentar cargar el icono
  let iconPath = path.join(__dirname, '../build/icons/win/icon.ico');
  
  // Si no existe, usar un icono por defecto
  const fs = require('fs');
  if (!fs.existsSync(iconPath)) {
    // Crear imagen por defecto si no hay icono
    iconPath = nativeImage.createEmpty().toDataURL();
  }
  
  tray = new Tray(iconPath);
  
  const contextMenu = Menu.buildFromTemplate([
    {
      label: 'Barbería App',
      enabled: false
    },
    {
      type: 'separator'
    },
    {
      label: `🌐 Abrir en navegador`,
      click: () => {
        shell.openExternal(`http://localhost:${port}`);
      }
    },
    {
      label: `📋 Copiar URL`,
      click: () => {
        const { clipboard } = require('electron');
        clipboard.writeText(`http://localhost:${port}`);
      }
    },
    {
      type: 'separator'
    },
    {
      label: '🔄 Buscar actualizaciones',
      click: () => {
        if (!isDev) {
          autoUpdater.checkForUpdates();
        }
      }
    },
    {
      type: 'separator'
    },
    {
      label: '❌ Salir',
      click: () => {
        app.quit();
      }
    }
  ]);
  
  tray.setToolTip('Barbería App - Servidor corriendo');
  tray.setContextMenu(contextMenu);
  
  // Click en el icono abre el navegador
  tray.on('click', () => {
    shell.openExternal(`http://localhost:${port}`);
  });
  
  console.log('✅ Icono en bandeja creado');
}

// ============================
// INICIAR APLICACIÓN
// ============================
async function startApp() {
  console.log('🌐 Iniciando aplicación...');
  
  try {
    // Iniciar servidor
    serverPort = await startLocalServer();
    const url = `http://localhost:${serverPort}`;
    
    // Crear icono en bandeja
    createTray(serverPort);
    
    console.log('🌐 Abriendo navegador...');
    console.log('🌐 URL:', url);
    
    // Abrir en el navegador predeterminado
    await shell.openExternal(url);
    
    console.log('✅ Navegador abierto exitosamente');
    
    // Verificar actualizaciones después de 3 segundos
    if (!isDev) {
      setTimeout(() => {
        autoUpdater.checkForUpdates();
      }, 3000);
    }
    
  } catch (error) {
    console.error('❌ Error al iniciar:', error);
    app.quit();
  }
}

// ============================
// CICLO DE VIDA DE LA APP
// ============================
app.whenReady().then(() => {
  console.log('✅ [App] Electron ready');
  
  if (isDev) {
    console.log('🔧 [App] Modo desarrollo');
  } else {
    console.log('📦 [App] Modo producción');
    startApp();
  }
});

// Evitar que la app se cierre cuando no hay ventanas
app.on('window-all-closed', (e: any) => {
  // No hacer nada - la app sigue corriendo en la bandeja
  console.log('ℹ️ [App] App corriendo en segundo plano');
});

app.on('activate', () => {
  // Reabrir navegador si está en macOS
  if (localServer && process.platform === 'darwin') {
    shell.openExternal(`http://localhost:${serverPort}`);
  }
});

// Limpiar al salir
app.on('before-quit', () => {
  console.log('🛑 [App] Cerrando aplicación...');
  
  if (tray) {
    tray.destroy();
    tray = null;
  }
  
  if (localServer) {
    console.log('🛑 [App] Cerrando servidor local...');
    localServer.close();
    localServer = null;
  }
});

// Permitir cerrar con Ctrl+C
process.on('SIGINT', () => {
  console.log('🛑 [App] SIGINT recibido, cerrando...');
  app.quit();
});

process.on('SIGTERM', () => {
  console.log('🛑 [App] SIGTERM recibido, cerrando...');
  app.quit();
});

console.log('✅ main.ts cargado completamente');