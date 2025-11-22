// src/services/sellos.service.ts

import { api } from './api';
import { HistorialSello, Premio, EstadisticasSellos } from '../types/cliente.types';

export const sellosService = {
  // Agregar sellos a un cliente
  async agregarSellos(
    clienteId: string,
    cantidad: number,
    motivo?: string
  ): Promise<{ cliente: any; historial: HistorialSello }> {
    const response = await api.post('/sellos/agregar', {
      clienteId,
      cantidad,
      motivo,
    });
    return response.data.data;
  },

  // Canjear sellos por un premio
  async canjearSellos(
    clienteId: string,
    premioId: string
  ): Promise<{ cliente: any; premio: Premio; historial: HistorialSello }> {
    const response = await api.post('/sellos/canjear', {
      clienteId,
      premioId,
    });
    return response.data.data;
  },

  // Obtener historial de sellos de un cliente
  async getHistorial(clienteId: string, limit = 20): Promise<HistorialSello[]> {
    const response = await api.get(`/sellos/historial/${clienteId}`, {
      params: { limit },
    });
    return response.data.data;
  },

  // Obtener premios disponibles
  async getPremios(): Promise<Premio[]> {
    const response = await api.get('/sellos/premios');
    return response.data.data;
  },

  // Obtener estadísticas de sellos de un cliente
  async getEstadisticas(clienteId: string): Promise<EstadisticasSellos> {
    const response = await api.get(`/sellos/estadisticas/${clienteId}`);
    return response.data.data;
  },

  // Crear un premio (admin)
  async crearPremio(data: {
    nombre: string;
    sellosRequeridos: number;
    descripcion?: string;
    orden?: number;
  }): Promise<Premio> {
    const response = await api.post('/sellos/premios', data);
    return response.data.data;
  },

  // Actualizar un premio (admin)
  async actualizarPremio(
    id: string,
    data: Partial<Premio>
  ): Promise<Premio> {
    const response = await api.put(`/sellos/premios/${id}`, data);
    return response.data.data;
  },

  // Eliminar un premio (admin)
  async eliminarPremio(id: string): Promise<void> {
    await api.delete(`/sellos/premios/${id}`);
  },
};