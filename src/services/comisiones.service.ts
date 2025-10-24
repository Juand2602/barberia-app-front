// src/services/comisiones.service.ts (FRONTEND)
import { api } from './api';
import {
  ComisionPendiente,
  PagoComision,
  RegistrarPagoComisionDTO
} from '../types/empleado.types';

export const comisionesService = {
  // Calcular comisiones pendientes de un empleado
  async calcularPendientes(
    empleadoId: string,
    fechaInicio: Date,
    fechaFin: Date
  ): Promise<ComisionPendiente> {
    const response = await api.get(
      `/comisiones/empleado/${empleadoId}/pendientes`,
      {
        params: {
          fechaInicio: fechaInicio.toISOString(),
          fechaFin: fechaFin.toISOString(),
        },
      }
    );
    return response.data.data;
  },

  // Obtener historial de pagos de un empleado
  async obtenerHistorial(empleadoId: string): Promise<PagoComision[]> {
    const response = await api.get(
      `/comisiones/empleado/${empleadoId}/historial`
    );
    return response.data.data;
  },

  // Registrar pago de comisión
  async registrarPago(
    empleadoId: string,
    data: RegistrarPagoComisionDTO
  ): Promise<PagoComision> {
    // ✅ Convertir las fechas a ISO string antes de enviar
    const payload = {
      ...data,
      fechaInicio: data.fechaInicio.toISOString(),
      fechaFin: data.fechaFin.toISOString(),
    };

    const response = await api.post(
      `/comisiones/empleado/${empleadoId}/pagar`,
      payload
    );
    return response.data.data;
  },
};