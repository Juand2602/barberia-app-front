// src/types/global.d.ts

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

// Declaraciones para importar imágenes
declare module '*.png' {
  const value: string;
  export default value;
}
declare module '*.jpg' {
  const value: string;
  export default value;
}
declare module '*.jpeg' {
  const value: string;
  export default value;
}
declare module '*.gif' {
  const value: string;
  export default value;
}
declare module '*.svg' {
  const value: string;
  export default value;
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

export {};
