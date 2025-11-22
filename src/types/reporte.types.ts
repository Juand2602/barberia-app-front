// src/types/reporte.types.ts - ACTUALIZADO CON INVENTARIO

import { EstadoPago } from './transaccion.types';

export interface PeriodoReporte {
  inicio: Date;
  fin: Date;
}

export interface Dashboard {
  periodo: PeriodoReporte;
  ventas: {
    total: number;
    cantidad: number;
  };
  citas: {
    total: number;
    porEstado: Record<string, number>;
  };
  clientes: {
    cantidad: number;
  };
  serviciosMasVendidos: Array<{
    nombre: string;
    cantidad: number;
    total: number;
  }>;
  empleadoTop: {
    nombre: string;
    total: number;
  } | null;
  comparativa: {
    actual: number;
    anterior: number;
    diferencia: number;
    porcentaje: number;
  };
}

export interface ReporteVentas {
  periodo: PeriodoReporte;
  resumen: {
    totalIngresos: number;
    cantidadVentas: number;
    promedioVenta: number;
    porMetodoPago: Record<string, { cantidad: number; total: number }>;
  };
  ventasPorDia: Array<{
    fecha: string;
    cantidad: number;
    total: number;
  }>;
  transacciones: Array<{
    id: string;
    fecha: Date;
    cliente: string;
    empleado: string;
    servicios: string;
    metodoPago: string;
    estadoPago: EstadoPago;
    total: number;
  }>;
}

export interface ReporteVentasPorEmpleado {
  periodo: PeriodoReporte;
  empleados: Array<{
    empleadoId: string;
    nombre: string;
    cantidadVentas: number;
    totalVentas: number;
    servicios: Record<string, number>;
  }>;
}

export interface ReporteVentasPorServicio {
  periodo: PeriodoReporte;
  servicios: Array<{
    servicioId: string;
    nombre: string;
    cantidadVendida: number;
    totalGenerado: number;
  }>;
}

export interface ReporteCitas {
  periodo: PeriodoReporte;
  resumen: {
    totalCitas: number;
    porEstado: Record<string, number>;
    tasaCancelacion: number;
    tasaCompletadas: number;
  };
  citasPorDia: Array<{
    fecha: string;
    total: number;
    completadas: number;
    canceladas: number;
    pendientes: number;
  }>;
  ocupacionPorEmpleado: Array<{
    empleadoId: string;
    nombre: string;
    totalCitas: number;
    completadas: number;
    canceladas: number;
  }>;
}

export interface ReporteFinanciero {
  periodo: PeriodoReporte;
  resumen: {
    totalIngresos: number;
    totalEgresos: number;
    utilidad: number;
    margenUtilidad: number;
  };
  ingresosPorMetodo: Record<string, number>;
  egresosPorMetodo: Record<string, number>;
  egresosPorCategoria: Record<string, number>;
  flujoDiario: Array<{
    fecha: string;
    ingresos: number;
    egresos: number;
    neto: number;
  }>;
  detalleIngresos: Array<{
    id: string;
    fecha: Date;
    cliente: string | null;
    empleado: string | null;
    metodoPago: string;
    total: number;
  }>;
  detalleEgresos: Array<{
    id: string;
    fecha: Date;
    concepto: string | null;
    categoria: string | null;
    metodoPago: string;
    total: number;
  }>;
  // ✅ NUEVO: Datos de inventario
  inventario?: {
    totalCompras: number;
    totalVentas: number;
    ganancia: number;
    ventasPorMetodo: Record<string, number>;
  };
}

export interface ReporteClientes {
  periodo: PeriodoReporte;
  resumen: {
    clientesNuevos: number;
    clientesActivos: number;
    ticketPromedio: number;
  };
  topClientes: Array<{
    clienteId: string;
    nombre: string;
    totalGastado: number;
    cantidadCompras: number;
  }>;
  clientesFrecuentes: Array<{
    clienteId: string;
    nombre: string;
    visitas: number;
  }>;
  nuevosClientes: Array<{
    id: string;
    nombre: string;
    telefono: string;
    fechaRegistro: Date;
  }>;
}

// ✅ NUEVO: Reporte de Inventario
export interface ReporteInventario {
  resumen: {
    totalProductos: number;
    productosStockBajo: number;
    valorTotalStock: number;
    totalCompras: number;
    totalVentas: number;
    gananciaTotal: number;
  };
  productosMasVendidos: Array<{
    productoId: string;
    nombre: string;
    categoria: string;
    cantidadVendida: number;
    totalVentas: number;
    ganancia: number;
  }>;
  ventasPorCategoria: Array<{
    categoria: string;
    cantidad: number;
    total: number;
  }>;
  movimientos: Array<{
    tipo: 'COMPRA' | 'VENTA';
    fecha: string;
    producto: string;
    cantidad: number;
    precioUnitario: number;
    total: number;
    metodoPago?: string;
    proveedor?: string;
  }>;
}