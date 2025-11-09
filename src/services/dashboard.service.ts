// src/services/dashboard.service.ts - ACTUALIZADO

import { api } from './api';
import { citasService } from './citas.service';

// 🌟 NUEVAS INTERFACES
export interface CitaResumen {
  id: string;
  radicado: string;
  cliente: string;
  telefono: string;
  empleado: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion: number;
  estado: string;
  origen: string;
  esNueva: boolean;
}

export interface DashboardCitas {
  success: boolean;
  fecha: string;
  stats: {
    total: number;
    nuevas: number;
    confirmadas: number;
    completadas: number;
    canceladas: number;
    enCurso: number;
  };
  nuevas: CitaResumen[];
  confirmadas: CitaResumen[];
  completadas: CitaResumen[];
  canceladas: CitaResumen[];
  porBarbero: {
    barbero: string;
    total: number;
    completadas: number;
    pendientes: number;
  }[];
}

export const dashboardService = {
  // Métricas existentes
  getMetricas: async () => {
    const response = await api.get('/reportes/metricas-dashboard');
    return response.data;
  },

  getProximasCitas: async (limit: number = 5) => {
    return citasService.getProximas(limit);
  },

  getServiciosPopulares: async (limit: number = 5) => {
    const response = await api.get(`/reportes/servicios-populares?limit=${limit}`);
    return response.data;
  },

  // 🌟 NUEVO: Obtener citas del día con notificaciones
  getCitasHoy: async (): Promise<DashboardCitas> => {
    const response = await api.get('/dashboard/citas-hoy');
    return response.data;
  },

  // 🌟 NUEVO: Solo notificaciones pendientes (para badge en navbar si quieres)
  getNotificacionesPendientes: async () => {
    const response = await api.get('/dashboard/notificaciones-pendientes');
    return response.data;
  },
};