import { create } from 'zustand';
import { cierreCajaService } from '@services/cierrecaja.service';
import { CierreCaja, CierreCajaEstadisticas } from '../types/cierrecaja.types';

interface AperturasEstadisticas {
  totalAperturas: number;
  sumaMontosIniciales: number;
}

interface CierreCajaState {
  cierres: CierreCaja[];
  estadisticas: CierreCajaEstadisticas | null;
  loading: boolean;
  error: string | null;

  // Aperturas
  aperturas: any[];
  aperturasEstadisticas: AperturasEstadisticas | null;

  // Acciones
  fetchCierres: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  fetchEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  fetchAperturas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  fetchAperturasEstadisticas: (fechaInicio?: Date, fechaFin?: Date) => Promise<void>;
  clearError: () => void;
}

export const useCierreCajaStore = create<CierreCajaState>((set) => ({
  cierres: [],
  estadisticas: null,
  loading: false,
  error: null,

  aperturas: [],
  aperturasEstadisticas: null,

  fetchCierres: async (fechaInicio?: Date, fechaFin?: Date) => {
    set({ loading: true, error: null });
    try {
      const cierres = await cierreCajaService.getAll(fechaInicio, fechaFin);
      set({ cierres, loading: false });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Error al cargar cierres',
        loading: false,
      });
    }
  },

  fetchEstadisticas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const estadisticas = await cierreCajaService.getEstadisticas(fechaInicio, fechaFin);
      set({ estadisticas: estadisticas || null });
    } catch (error: any) {
      console.error('Error al cargar estadísticas:', error);
    }
  },

  fetchAperturas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const aperturas = await cierreCajaService.getAperturas(fechaInicio, fechaFin);
      set({ aperturas: aperturas || [] });
    } catch (error: any) {
      console.error('Error al cargar aperturas:', error);
    }
  },

  fetchAperturasEstadisticas: async (fechaInicio?: Date, fechaFin?: Date) => {
    try {
      const stats = await cierreCajaService.getAperturasEstadisticas(fechaInicio, fechaFin);
      set({ aperturasEstadisticas: stats || null });
    } catch (error: any) {
      console.error('Error al cargar estadísticas de aperturas:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
