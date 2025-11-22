// src/services/inventario.service.ts

import {api} from './api';
import {
  ProductoInventario,
  CreateProductoInventarioDTO,
  UpdateProductoInventarioDTO,
  CompraInventario,
  CreateCompraInventarioDTO,
  VentaInventario,
  CreateVentaInventarioDTO,
  EstadisticasInventario,
  ReporteInventario,
  FiltrosInventario,
  FiltrosReporteInventario,
} from '@/types/inventario.types';

class InventarioService {
  // ==================== PRODUCTOS ====================

  async getAllProductos(filtros?: FiltrosInventario): Promise<ProductoInventario[]> {
    const params = new URLSearchParams();
    if (filtros?.categoria) params.append('categoria', filtros.categoria);
    if (filtros?.activo !== undefined) params.append('activo', String(filtros.activo));
    if (filtros?.stockBajo) params.append('stockBajo', 'true');

    const response = await api.get(`/inventario/productos?${params.toString()}`);
    return response.data.data;
  }

  async getProductoById(id: string): Promise<ProductoInventario> {
    const response = await api.get(`/inventario/productos/${id}`);
    return response.data.data;
  }

  async createProducto(data: CreateProductoInventarioDTO): Promise<ProductoInventario> {
    const response = await api.post('/inventario/productos', data);
    return response.data.data;
  }

  async updateProducto(id: string, data: UpdateProductoInventarioDTO): Promise<ProductoInventario> {
    const response = await api.put(`/inventario/productos/${id}`, data);
    return response.data.data;
  }

  async deleteProducto(id: string): Promise<void> {
    await api.delete(`/inventario/productos/${id}`);
  }

  async getProductosStockBajo(): Promise<ProductoInventario[]> {
    const response = await api.get('/inventario/productos/stock-bajo');
    return response.data.data;
  }

  // ==================== COMPRAS ====================

  async getAllCompras(filtros?: {
    fechaInicio?: Date;
    fechaFin?: Date;
    productoId?: string;
  }): Promise<CompraInventario[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio.toISOString());
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin.toISOString());
    if (filtros?.productoId) params.append('productoId', filtros.productoId);

    const response = await api.get(`/inventario/compras?${params.toString()}`);
    return response.data.data;
  }

  async registrarCompra(data: CreateCompraInventarioDTO): Promise<CompraInventario> {
    const response = await api.post('/inventario/compras', data);
    return response.data.data;
  }

  async deleteCompra(id: string): Promise<void> {
    await api.delete(`/inventario/compras/${id}`);
  }

  // ==================== VENTAS ====================

  async getAllVentas(filtros?: {
    fechaInicio?: Date;
    fechaFin?: Date;
    productoId?: string;
  }): Promise<VentaInventario[]> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio.toISOString());
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin.toISOString());
    if (filtros?.productoId) params.append('productoId', filtros.productoId);

    const response = await api.get(`/inventario/ventas?${params.toString()}`);
    return response.data.data;
  }

  async registrarVenta(data: CreateVentaInventarioDTO): Promise<VentaInventario> {
    const response = await api.post('/inventario/ventas', data);
    return response.data.data;
  }

  async deleteVenta(id: string): Promise<void> {
    await api.delete(`/inventario/ventas/${id}`);
  }

  // ==================== ESTADÍSTICAS Y REPORTES ====================

  async getEstadisticas(): Promise<EstadisticasInventario> {
    const response = await api.get('/inventario/estadisticas');
    return response.data.data;
  }

  async getReporte(filtros?: FiltrosReporteInventario): Promise<ReporteInventario> {
    const params = new URLSearchParams();
    if (filtros?.fechaInicio) params.append('fechaInicio', filtros.fechaInicio.toISOString());
    if (filtros?.fechaFin) params.append('fechaFin', filtros.fechaFin.toISOString());
    if (filtros?.productoId) params.append('productoId', filtros.productoId);
    if (filtros?.categoria) params.append('categoria', filtros.categoria);

    const response = await api.get(`/inventario/reporte?${params.toString()}`);
    return response.data.data;
  }
}

export const inventarioService = new InventarioService();