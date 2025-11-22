// src/types/inventario.types.ts
// ==================== CATEGORÍAS ====================
export const CATEGORIAS_INVENTARIO = [
  'Bebidas',
  'Snacks',
  'Insumos',
  'Otros',
] as const;

export type CategoriaInventario = typeof CATEGORIAS_INVENTARIO[number];

export const UNIDADES_MEDIDA = [
  'Unidad',
  'Caja',
  'Paquete',
] as const;

export type UnidadMedida = typeof UNIDADES_MEDIDA[number];

// ==================== PRODUCTO ====================
export interface ProductoInventario {
  id: string;
  nombre: string;
  categoria: CategoriaInventario;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  unidadMedida: UnidadMedida;
  activo: boolean;
  compras?: CompraInventario[];
  ventas?: VentaInventario[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductoInventarioDTO {
  nombre: string;
  categoria: CategoriaInventario;
  precioCompra: number;
  precioVenta: number;
  stock?: number;
  stockMinimo?: number;
  unidadMedida?: UnidadMedida;
  activo?: boolean;
}

export interface UpdateProductoInventarioDTO {
  nombre?: string;
  categoria?: CategoriaInventario;
  precioCompra?: number;
  precioVenta?: number;
  stockMinimo?: number;
  unidadMedida?: UnidadMedida;
  activo?: boolean;
}

// ==================== COMPRA ====================
export interface CompraInventario {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
  proveedor?: string;
  factura?: string;
  notas?: string;
  producto: ProductoInventario;
  createdAt: string;
}

export interface CreateCompraInventarioDTO {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  fecha?: string;
  proveedor?: string;
  factura?: string;
  notas?: string;
}

// ==================== VENTA ====================
export interface VentaInventario {
  id: string;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  total: number;
  fecha: string;
  metodoPago: string;
  notas?: string;
  producto: ProductoInventario;
  createdAt: string;
}

export interface CreateVentaInventarioDTO {
  productoId: string;
  cantidad: number;
  metodoPago?: string;
  notas?: string;
}

// ==================== ESTADÍSTICAS ====================
export interface EstadisticasInventario {
  totalProductos: number;
  productosActivos: number;
  productosStockBajo: number;
  valorTotalStock: number;
  totalCompras: number;
  totalVentas: number;
  gananciaTotal: number;
  productoMasVendido?: {
    producto: ProductoInventario;
    cantidadVendida: number;
    totalVentas: number;
  };
}

export interface ReporteInventario {
  periodo: {
    inicio: string;
    fin: string;
  };
  resumen: {
    totalVentas: number;
    cantidadVendida: number;
    ingresosBrutos: number;
    costoProductos: number;
    gananciaTotal: number;
    margenPromedio: number;
  };
  ventasPorCategoria: {
    categoria: string;
    cantidad: number;
    ingresos: number;
    ganancia: number;
  }[];
  productosMasVendidos: {
    producto: ProductoInventario;
    cantidadVendida: number;
    ingresos: number;
    ganancia: number;
  }[];
  ventasPorMetodoPago: {
    metodoPago: string;
    cantidad: number;
    total: number;
  }[];
}

export interface FiltrosInventario {
  categoria?: CategoriaInventario;
  activo?: boolean;
  stockBajo?: boolean;
}

export interface FiltrosReporteInventario {
  fechaInicio?: Date;
  fechaFin?: Date;
  productoId?: string;
  categoria?: CategoriaInventario;
}