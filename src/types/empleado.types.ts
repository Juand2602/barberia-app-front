// src/types/empleado.types.ts

export interface Horario {
  inicio: string; // "09:00"
  fin: string;    // "18:00"
}

export interface Empleado {
  id: string;
  nombre: string;
  telefono: string;
  especialidades: string[];
  porcentajeComision: number; // ✅ NUEVO
  horarioLunes: Horario | null;
  horarioMartes: Horario | null;
  horarioMiercoles: Horario | null;
  horarioJueves: Horario | null;
  horarioViernes: Horario | null;
  horarioSabado: Horario | null;
  horarioDomingo: Horario | null;
  activo: boolean;
  fechaIngreso: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    citas: number;
    transacciones: number;
  };
}

export interface EmpleadoEstadisticas {
  totalCitas: number;
  totalIngresos: number;
}

export interface CreateEmpleadoDTO {
  nombre: string;
  telefono: string;
  especialidades: string[];
  porcentajeComision?: number; // ✅ NUEVO (opcional, default 50)
  horarioLunes?: Horario;
  horarioMartes?: Horario;
  horarioMiercoles?: Horario;
  horarioJueves?: Horario;
  horarioViernes?: Horario;
  horarioSabado?: Horario;
  horarioDomingo?: Horario;
}

export interface UpdateEmpleadoDTO {
  nombre?: string;
  telefono?: string;
  especialidades?: string[];
  porcentajeComision?: number; // ✅ NUEVO
  horarioLunes?: Horario | null;
  horarioMartes?: Horario | null;
  horarioMiercoles?: Horario | null;
  horarioJueves?: Horario | null;
  horarioViernes?: Horario | null;
  horarioSabado?: Horario | null;
  horarioDomingo?: Horario | null;
  activo?: boolean;
}

// ✅ NUEVOS TIPOS PARA COMISIONES

export interface ComisionPendiente {
  empleado: {
    id: string;
    nombre: string;
    porcentajeComision: number;
  };
  periodo: {
    inicio: Date;
    fin: Date;
  };
  totalVentas: number;
  montoComision: number;
  cantidadTransacciones: number;
  transacciones: TransaccionComision[];
}

export interface TransaccionComision {
  id: string;
  fecha: Date;
  total: number;
  metodoPago: string;
  cliente: string;
  items: {
    servicio: string;
    cantidad: number;
    precio: number;
  }[];
}

export interface PagoComision {
  id: string;
  empleadoId: string;
  periodo: string;
  fechaPago: Date;
  fechaInicio: Date;
  fechaFin: Date;
  totalVentas: number;
  porcentaje: number;
  montoComision: number;
  montoPagado: number;
  diferencia: number;
  metodoPago: string;
  referencia?: string;
  notas?: string;
  transaccionIds: string[];
  cantidadTransacciones: number;
  empleado?: Empleado;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrarPagoComisionDTO {
  empleadoId: string;
  periodo: string;
  fechaInicio: Date;
  fechaFin: Date;
  metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
  referencia?: string;
  notas?: string;
  ajuste?: number;
}