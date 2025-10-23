// src/services/comisiones.service.ts

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
    const response = await api.post(
      `/comisiones/empleado/${empleadoId}/pagar`,
      data
    );
    return response.data.data;
  },
};