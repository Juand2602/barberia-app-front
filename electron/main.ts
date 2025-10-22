import { app, BrowserWindow } from 'electron';
import path from 'path';
import { startServer } from './server/app';

let mainWindow: BrowserWindow | null = null;
let serverInstance: any = null;

const isDev = process.env.NODE_ENV === 'development';

async function createWindow() {
  // Iniciar el servidor Express
  serverInstance = await startServer();
  console.log('✅ Servidor backend iniciado en puerto 3001');

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
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (serverInstance) {
    serverInstance.close();
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