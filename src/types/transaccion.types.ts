// src/types/transaccion.types.ts - ACTUALIZADO CON PAGO MIXTO

import { Cliente } from './cliente.types';
import { Empleado } from './empleado.types';
import { Servicio } from './servicio.types';
import { Cita } from './cita.types';

export type TipoTransaccion = 'INGRESO' | 'EGRESO';
export type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO' | 'PENDIENTE'; // ✅ AGREGAR MIXTO
export type EstadoPago = 'PENDIENTE' | 'PAGADO';

export interface TransaccionItem {
  id: string;
  transaccionId: string;
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  servicio: Servicio;
  createdAt: string;
}

export interface Transaccion {
  id: string;
  tipo: TipoTransaccion;
  clienteId: string | null;
  empleadoId: string | null;
  citaId: string | null;
  fecha: string;
  total: number;
  metodoPago: MetodoPago;
  estadoPago: EstadoPago;
  referencia: string | null;
  concepto: string | null;
  categoria: string | null;
  notas: string | null;
  
  // ✅ NUEVOS CAMPOS PARA PAGO MIXTO
  montoEfectivo: number | null;
  montoTransferencia: number | null;
  
  cliente?: Cliente;
  empleado?: Empleado;
  cita?: Cita & { empleado?: Empleado };
  items: TransaccionItem[];
  createdAt: string;
  updatedAt: string;
}

export interface TransaccionItemDTO {
  servicioId: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface CreateTransaccionDTO {
  tipo: TipoTransaccion;
  clienteId?: string;
  empleadoId?: string;
  citaId?: string;
  fecha?: string;
  total: number;
  metodoPago: MetodoPago;
  estadoPago?: EstadoPago;
  referencia?: string;
  concepto?: string;
  categoria?: string;
  notas?: string;
  
  // ✅ NUEVOS CAMPOS PARA PAGO MIXTO
  montoEfectivo?: number;
  montoTransferencia?: number;
  
  items: TransaccionItemDTO[];
}

export interface UpdateTransaccionDTO {
  tipo?: TipoTransaccion;
  clienteId?: string | null;
  empleadoId?: string | null;
  citaId?: string | null;
  fecha?: string;
  total?: number;
  metodoPago?: MetodoPago;
  estadoPago?: EstadoPago;
  referencia?: string | null;
  concepto?: string | null;
  categoria?: string | null;
  notas?: string | null;
  
  // ✅ NUEVOS CAMPOS PARA PAGO MIXTO
  montoEfectivo?: number | null;
  montoTransferencia?: number | null;
}

export interface MarcarPagadaDTO {
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'; // ✅ AGREGAR MIXTO
  referencia?: string;
  
  // ✅ NUEVOS CAMPOS PARA PAGO MIXTO
  montoEfectivo?: number;
  montoTransferencia?: number;
}

export interface TransaccionesEstadisticas {
  totalTransacciones: number;
  totalTransaccionesPagadas: number;
  cantidadIngresos: number;
  cantidadEgresos: number;
  totalIngresos: number;
  totalEgresos: number;
  balance: number;
  totalEfectivo: number;
  totalTransferencias: number;
  totalPagado: number;
  totalPendiente: number;
}

export interface TransaccionesFiltros {
  fechaInicio?: Date;
  fechaFin?: Date;
  tipo?: TipoTransaccion;
  metodoPago?: MetodoPago;
  estadoPago?: EstadoPago;
  empleadoId?: string;
  clienteId?: string;
  citaId?: string;
}

export interface ServicioMasVendido {
  servicioId: string;
  nombre: string;
  cantidad: number;
  total: number;
}

export interface IngresosPorEmpleado {
  empleadoId: string;
  nombre: string;
  totalTransacciones: number;
  totalIngresos: number;
}

// Categorías de egresos
export const CATEGORIAS_EGRESOS = [
  'Servicios Públicos',
  'Arriendo',
  'Productos de Consumo',
  'Mantenimiento',
  'Nómina',
  'Publicidad',
  'Impuestos',
  'Otros',
] as const;

export type CategoriaEgreso = typeof CATEGORIAS_EGRESOS[number];