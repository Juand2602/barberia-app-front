// src/types/cliente.types.ts - ACTUALIZADO

export interface Cliente {
  id: string;
  nombre: string;
  telefono: string;
  email: string | null;
  fechaRegistro: string;
  notas: string | null;
  activo: boolean;
  // 🌟 NUEVO: Campos de sellos
  sellos: number;
  sellosCanjeados: number;
  ultimoSello: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    citas: number;
    transacciones: number;
  };
}

export interface ClienteDetalle extends Cliente {
  citas: Cita[];
  transacciones: Transaccion[];
}

export interface Cita {
  id: string;
  servicioNombre: string;
  fechaHora: string;
  estado: string;
  empleado: {
    nombre: string;
  };
}

export interface Transaccion {
  id: string;
  fecha: string;
  total: number;
  metodoPago: string;
  items: {
    servicio: {
      nombre: string;
    };
    cantidad: number;
    subtotal: number;
  }[];
}

export interface ClienteEstadisticas {
  totalCitas: number;
  totalGastado: number;
  ultimaVisita: string | null;
}

export interface CreateClienteDTO {
  nombre: string;
  telefono: string;
  email?: string;
  notas?: string;
}

export interface UpdateClienteDTO {
  nombre?: string;
  telefono?: string;
  email?: string;
  notas?: string;
  activo?: boolean;
}

// 🌟 NUEVO: Tipos para sistema de sellos
export interface HistorialSello {
  id: string;
  clienteId: string;
  tipo: 'AGREGADO' | 'CANJEADO';
  cantidad: number;
  motivo?: string;
  sellosTotales: number;
  createdAt: string;
}

export interface Premio {
  id: string;
  nombre: string;
  sellosRequeridos: number;
  descripcion?: string;
  activo: boolean;
  orden: number;
}

export interface EstadisticasSellos {
  sellosActuales: number;
  sellosCanjeados: number;
  totalAcumulados: number;
  ultimoSello: string | null;
  proximoPremio: {
    nombre: string;
    sellosRequeridos: number;
    sellosRestantes: number;
  } | null;
}