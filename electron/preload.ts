import { contextBridge, ipcRenderer } from 'electron';

// Exponer API segura al frontend
contextBridge.exposeInMainWorld('electron', {
  // Información de la plataforma
  platform: process.platform,
  
  // ============================
  // API DE LICENCIAS
  // ============================
  getMachineId: () => ipcRenderer.invoke('get-machine-id'),
  getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
  
  // ============================
  // API DE AUTO-UPDATER
  // ============================
  onUpdateStatus: (callback: (data: UpdateStatus) => void) => {
    const subscription = (_event: any, data: UpdateStatus) => callback(data);
    ipcRenderer.on('update-status', subscription);
    
    // Retornar función para remover el listener
    return () => {
      ipcRenderer.removeListener('update-status', subscription);
    };
  },
  
  checkForUpdates: () => {
    ipcRenderer.send('check-for-updates');
  },
  
  downloadUpdate: () => {
    ipcRenderer.send('download-update');
  },
  
  installUpdate: () => {
    ipcRenderer.send('install-update');
  },
  
  removeUpdateListener: () => {
    ipcRenderer.removeAllListeners('update-status');
  }
});

// ============================
// TIPOS TYPESCRIPT
// ============================
export interface SystemInfo {
  machineId: string;
  hostname: string;
  osVersion: string;
  cpuModel: string;
  platform: string;
}

export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  message: string;
  version?: string;
  percent?: number;
  error?: string;
}

// Declarar tipos globales para TypeScript
declare global {
  interface Window {
    electron: {
      platform: string;
      getMachineId: () => Promise<string>;
      getSystemInfo: () => Promise<SystemInfo>;
      onUpdateStatus: (callback: (data: UpdateStatus) => void) => () => void;
      checkForUpdates: () => void;
      downloadUpdate: () => void;
      installUpdate: () => void;
      removeUpdateListener: () => void;
    };
  }
}