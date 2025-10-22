// src/services/dashboard.service.ts

import { api } from './api';
import { citasService } from './citas.service';

export const dashboardService = {
  getMetricas: async () => {
    const response = await api.get('/reportes/metricas-dashboard');
    return response.data;
  },

  getProximasCitas: async (limit: number = 5) => {
    return citasService.getProximas(limit);
  },

  // 🆕 Función para obtener los servicios populares
  getServiciosPopulares: async (limit: number = 5) => {
    const response = await api.get(`/reportes/servicios-populares?limit=${limit}`);
    return response.data;
  }
};