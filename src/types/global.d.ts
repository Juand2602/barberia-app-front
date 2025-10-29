// src/types/global.d.ts

// Primero, asegúrate de que los tipos que usa la interfaz estén disponibles.
// Puedes copiarlos aquí o importarlos desde preload.ts si lo configuras como módulo.
// Lo más sencillo es copiarlos.

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

// Ahora, la declaración global que le interesa a TypeScript
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

// No olvides esta línea para que el archivo sea tratado como un módulo.
export {};