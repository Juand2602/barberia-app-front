// src/components/inventario/ProductoDetalle.tsx

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, ShoppingCart, TrendingUp, AlertTriangle, X } from 'lucide-react';
import { ProductoInventario } from '@/types/inventario.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface ProductoDetalleProps {
  producto: ProductoInventario;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const ProductoDetalle: React.FC<ProductoDetalleProps> = ({
  producto,
  onEliminar,
  onCerrar,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const calcularMargen = () => {
    if (producto.precioVenta === 0) return 0;
    return ((producto.precioVenta - producto.precioCompra) / producto.precioVenta * 100).toFixed(1);
  };

  const getStockStatus = () => {
    if (producto.stock === 0) {
      return { text: 'Sin Stock', color: 'text-red-600', bg: 'bg-red-50' };
    }
    if (producto.stock <= producto.stockMinimo) {
      return { text: 'Stock Bajo', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    }
    return { text: 'Disponible', color: 'text-green-600', bg: 'bg-green-50' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="space-y-6">
      {/* Header con información principal */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <Package className="text-blue-600" size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{producto.nombre}</h2>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant="default">{producto.categoria}</Badge>
              <Badge variant={producto.activo ? 'success' : 'danger'}>
                {producto.activo ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
        <button
          onClick={onCerrar}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Estado del Stock */}
      <div className={`${stockStatus.bg} border border-${stockStatus.color.replace('text-', '')} rounded-lg p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {producto.stock === 0 ? (
              <AlertTriangle className={stockStatus.color} size={24} />
            ) : (
              <Package className={stockStatus.color} size={24} />
            )}
            <div>
              <p className="text-sm text-gray-600">Estado del Stock</p>
              <p className={`text-xl font-bold ${stockStatus.color}`}>
                {stockStatus.text}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Existencia Actual</p>
            <p className="text-3xl font-bold text-gray-900">
              {producto.stock} <span className="text-lg text-gray-600">{producto.unidadMedida}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Mínimo: {producto.stockMinimo} {producto.unidadMedida}
            </p>
          </div>
        </div>
      </div>

      {/* Información de Precios */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Precio de Compra</p>
          <p className="text-2xl font-bold text-gray-900">
            {formatCurrency(producto.precioCompra)}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Precio de Venta</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(producto.precioVenta)}
          </p>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Margen de Ganancia</p>
          <p className={`text-2xl font-bold ${
            Number(calcularMargen()) >= 30 ? 'text-green-600' : 
            Number(calcularMargen()) >= 15 ? 'text-yellow-600' : 
            'text-red-600'
          }`}>
            {calcularMargen()}%
          </p>
        </div>
      </div>

      {/* Valor del Inventario */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 mb-1">Valor Total en Inventario</p>
            <p className="text-2xl font-bold text-purple-900">
              {formatCurrency(producto.stock * producto.precioCompra)}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Basado en {producto.stock} {producto.unidadMedida} × {formatCurrency(producto.precioCompra)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Valor Potencial de Venta</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(producto.stock * producto.precioVenta)}
            </p>
          </div>
        </div>
      </div>

      {/* Historial de Movimientos */}
      <div className="space-y-4">
        {/* Últimas Compras */}
        {producto.compras && producto.compras.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="text-blue-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Últimas Compras ({producto.compras.length})
              </h3>
            </div>
            <div className="space-y-2">
              {producto.compras.slice(0, 5).map((compra) => (
                <div
                  key={compra.id}
                  className="flex items-center justify-between p-3 bg-blue-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {compra.cantidad} {producto.unidadMedida} × {formatCurrency(compra.precioUnitario)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(compra.fecha), "dd MMM yyyy HH:mm", { locale: es })}
                    </p>
                    {compra.proveedor && (
                      <p className="text-xs text-gray-500">Proveedor: {compra.proveedor}</p>
                    )}
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatCurrency(compra.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Últimas Ventas */}
        {producto.ventas && producto.ventas.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ShoppingCart className="text-green-600" size={20} />
              <h3 className="text-lg font-semibold text-gray-900">
                Últimas Ventas ({producto.ventas.length})
              </h3>
            </div>
            <div className="space-y-2">
              {producto.ventas.slice(0, 5).map((venta) => (
                <div
                  key={venta.id}
                  className="flex items-center justify-between p-3 bg-green-50 rounded-lg"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {venta.cantidad} {producto.unidadMedida} × {formatCurrency(venta.precioUnitario)}
                    </p>
                    <p className="text-xs text-gray-600">
                      {format(new Date(venta.fecha), "dd MMM yyyy HH:mm", { locale: es })}
                    </p>
                    <p className="text-xs text-gray-500">
                      Método: {venta.metodoPago}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">
                    {formatCurrency(venta.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Información adicional */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Información del Sistema</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Creado:</span>
            <span className="ml-2 text-gray-900">
              {format(new Date(producto.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
          <div>
            <span className="text-gray-600">Última actualización:</span>
            <span className="ml-2 text-gray-900">
              {format(new Date(producto.updatedAt), "dd/MM/yyyy HH:mm", { locale: es })}
            </span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex justify-between pt-4 border-t">
        <Button
          variant="danger"
          onClick={onEliminar}
          disabled={!producto.activo}
        >
          Eliminar Producto
        </Button>
        <Button variant="secondary" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};