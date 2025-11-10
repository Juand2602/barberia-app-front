// src/types/global.d.ts

/// <reference types="vite/client" />

// ============================
// TIPOS DE VITE ENV
// ============================
interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_ENV: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
  readonly MODE: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// ============================
// TIPOS DE ELECTRON
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

// ============================
// MÓDULOS DE IMÁGENES
// ============================
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

// ============================
// DECLARACIÓN GLOBAL WINDOW
// ============================
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