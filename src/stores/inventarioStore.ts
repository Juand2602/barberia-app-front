// src/stores/inventarioStore.ts

import { create } from 'zustand';
import { inventarioService } from '@/services/inventario.service';
import {
  ProductoInventario,
  CompraInventario,
  VentaInventario,
  EstadisticasInventario,
  ReporteInventario,
  CreateProductoInventarioDTO,
  UpdateProductoInventarioDTO,
  CreateCompraInventarioDTO,
  CreateVentaInventarioDTO,
  FiltrosInventario,
  FiltrosReporteInventario,
} from '@/types/inventario.types';

interface InventarioState {
  // Estado
  productos: ProductoInventario[];
  productosStockBajo: ProductoInventario[];
  compras: CompraInventario[];
  ventas: VentaInventario[];
  estadisticas: EstadisticasInventario | null;
  reporte: ReporteInventario | null;
  loading: boolean;
  error: string | null;

  // Productos
  fetchProductos: (filtros?: FiltrosInventario) => Promise<void>;
  fetchProductoById: (id: string) => Promise<ProductoInventario>;
  createProducto: (data: CreateProductoInventarioDTO) => Promise<void>;
  updateProducto: (id: string, data: UpdateProductoInventarioDTO) => Promise<void>;
  deleteProducto: (id: string) => Promise<void>;
  fetchProductosStockBajo: () => Promise<void>;

  // Compras
  fetchCompras: (filtros?: { fechaInicio?: Date; fechaFin?: Date; productoId?: string }) => Promise<void>;
  registrarCompra: (data: CreateCompraInventarioDTO) => Promise<void>;
  deleteCompra: (id: string) => Promise<void>;

  // Ventas
  fetchVentas: (filtros?: { fechaInicio?: Date; fechaFin?: Date; productoId?: string }) => Promise<void>;
  registrarVenta: (data: CreateVentaInventarioDTO) => Promise<void>;
  deleteVenta: (id: string) => Promise<void>;

  // Estadísticas y reportes
  fetchEstadisticas: () => Promise<void>;
  fetchReporte: (filtros?: FiltrosReporteInventario) => Promise<void>;

  // Utilidades
  clearError: () => void;
  reset: () => void;
}

export const useInventarioStore = create<InventarioState>((set, get) => ({
  // Estado inicial
  productos: [],
  productosStockBajo: [],
  compras: [],
  ventas: [],
  estadisticas: null,
  reporte: null,
  loading: false,
  error: null,

  // ==================== PRODUCTOS ====================

  fetchProductos: async (filtros?: FiltrosInventario) => {
    set({ loading: true, error: null });
    try {
      const productos = await inventarioService.getAllProductos(filtros);
      set({ productos, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar productos',
        loading: false 
      });
    }
  },

  fetchProductoById: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const producto = await inventarioService.getProductoById(id);
      set({ loading: false });
      return producto;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar producto',
        loading: false 
      });
      throw error;
    }
  },

  createProducto: async (data: CreateProductoInventarioDTO) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.createProducto(data);
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al crear producto',
        loading: false 
      });
      throw error;
    }
  },

  updateProducto: async (id: string, data: UpdateProductoInventarioDTO) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.updateProducto(id, data);
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar producto',
        loading: false 
      });
      throw error;
    }
  },

  deleteProducto: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.deleteProducto(id);
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al eliminar producto',
        loading: false 
      });
      throw error;
    }
  },

  fetchProductosStockBajo: async () => {
    set({ loading: true, error: null });
    try {
      const productos = await inventarioService.getProductosStockBajo();
      set({ productosStockBajo: productos, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar productos con stock bajo',
        loading: false 
      });
    }
  },

  // ==================== COMPRAS ====================

  fetchCompras: async (filtros?) => {
    set({ loading: true, error: null });
    try {
      const compras = await inventarioService.getAllCompras(filtros);
      set({ compras, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar compras',
        loading: false 
      });
    }
  },

  registrarCompra: async (data: CreateCompraInventarioDTO) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.registrarCompra(data);
      await get().fetchCompras();
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar compra',
        loading: false 
      });
      throw error;
    }
  },

  deleteCompra: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.deleteCompra(id);
      await get().fetchCompras();
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al eliminar compra',
        loading: false 
      });
      throw error;
    }
  },

  // ==================== VENTAS ====================

  fetchVentas: async (filtros?) => {
    set({ loading: true, error: null });
    try {
      const ventas = await inventarioService.getAllVentas(filtros);
      set({ ventas, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar ventas',
        loading: false 
      });
    }
  },

  registrarVenta: async (data: CreateVentaInventarioDTO) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.registrarVenta(data);
      await get().fetchVentas();
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al registrar venta',
        loading: false 
      });
      throw error;
    }
  },

  deleteVenta: async (id: string) => {
    set({ loading: true, error: null });
    try {
      await inventarioService.deleteVenta(id);
      await get().fetchVentas();
      await get().fetchProductos();
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al eliminar venta',
        loading: false 
      });
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS Y REPORTES ====================

  fetchEstadisticas: async () => {
    set({ loading: true, error: null });
    try {
      const estadisticas = await inventarioService.getEstadisticas();
      set({ estadisticas, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar estadísticas',
        loading: false 
      });
    }
  },

  fetchReporte: async (filtros?: FiltrosReporteInventario) => {
    set({ loading: true, error: null });
    try {
      const reporte = await inventarioService.getReporte(filtros);
      set({ reporte, loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al generar reporte',
        loading: false 
      });
    }
  },

  // ==================== UTILIDADES ====================

  clearError: () => set({ error: null }),

  reset: () => set({
    productos: [],
    productosStockBajo: [],
    compras: [],
    ventas: [],
    estadisticas: null,
    reporte: null,
    loading: false,
    error: null,
  }),
}));