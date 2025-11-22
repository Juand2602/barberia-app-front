// src/components/tables/ProductosInventarioTable.tsx

import React from 'react';
import { Eye, Edit2, Trash2, Package, AlertTriangle } from 'lucide-react';
import { ProductoInventario } from '@/types/inventario.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface ProductosInventarioTableProps {
  productos: ProductoInventario[];
  onView: (producto: ProductoInventario) => void;
  onEdit: (producto: ProductoInventario) => void;
  onDelete: (producto: ProductoInventario) => void;
}

export const ProductosInventarioTable: React.FC<ProductosInventarioTableProps> = ({
  productos,
  onView,
  onEdit,
  onDelete,
}) => {
  if (productos.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="mx-auto text-gray-400 mb-4" size={64} />
        <p className="text-gray-500 text-lg">No hay productos registrados</p>
        <p className="text-gray-400 text-sm mt-2">
          Agrega tu primer producto para comenzar
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStockBadge = (producto: ProductoInventario) => {
    if (producto.stock === 0) {
      return <Badge variant="danger">Sin Stock</Badge>;
    }
    if (producto.stock <= producto.stockMinimo) {
      return <Badge variant="warning">Stock Bajo</Badge>;
    }
    return <Badge variant="success">Disponible</Badge>;
  };

  const getCategoriaBadge = (categoria: string) => {
    const colores: Record<string, string> = {
      Bebidas: 'bg-blue-100 text-blue-800',
      Snacks: 'bg-yellow-100 text-yellow-800',
      Insumos: 'bg-purple-100 text-purple-800',
      Otros: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${colores[categoria] || colores.OTROS}`}>
        {categoria}
      </span>
    );
  };

  const calcularMargen = (precioCompra: number, precioVenta: number) => {
    if (precioVenta === 0) return 0;
    return ((precioVenta - precioCompra) / precioVenta * 100).toFixed(1);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Producto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Categoría
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Stock
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              P. Compra
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              P. Venta
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Margen
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {productos.map((producto) => {
            const margen = calcularMargen(producto.precioCompra, producto.precioVenta);
            const stockBajo = producto.stock <= producto.stockMinimo;

            return (
              <tr
                key={producto.id}
                className={`hover:bg-gray-50 transition-colors ${
                  stockBajo ? 'bg-red-50/30' : ''
                } ${!producto.activo ? 'opacity-60' : ''}`}
              >
                {/* Producto */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    {stockBajo && (
                      <AlertTriangle className="text-red-600 flex-shrink-0" size={20} />
                    )}
                    <div>
                      <div className="text-sm font-medium text-gray-900">{producto.nombre}</div>
                      <div className="text-sm text-gray-500">{producto.unidadMedida}</div>
                    </div>
                  </div>
                </td>

                {/* Categoría */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getCategoriaBadge(producto.categoria)}
                </td>

                {/* Stock - Modificado para mantener formato consistente */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center">
                    <span
                      className={`text-sm font-medium ${
                        producto.stock === 0
                          ? 'text-red-600'
                          : stockBajo
                          ? 'text-yellow-600'
                          : 'text-green-600'
                      }`}
                    >
                      {producto.stock}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      (mín: {producto.stockMinimo})
                    </span>
                  </div>
                </td>

                {/* Precio Compra - Modificado para mantener formato consistente */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm text-gray-900">
                    {formatCurrency(producto.precioCompra)}
                  </div>
                </td>

                {/* Precio Venta - Modificado para mantener formato consistente */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="text-sm font-medium text-gray-900">
                    {formatCurrency(producto.precioVenta)}
                  </div>
                </td>

                {/* Margen - Modificado para mantener formato consistente */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                    <span
                      className={`text-sm font-medium ${
                        Number(margen) >= 30
                          ? 'text-green-600'
                          : Number(margen) >= 15
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {margen}%
                    </span>
                  </div>
                </td>

                {/* Estado */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {getStockBadge(producto)}
                </td>

                {/* Acciones */}
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onView(producto)}
                      title="Ver detalle"
                    >
                      <Eye size={16} />
                    </Button>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(producto)}
                      title="Editar"
                    >
                      <Edit2 size={16} className="text-blue-600" />
                    </Button>

                    {producto.activo && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDelete(producto)}
                        title="Eliminar"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Resumen */}
      <div className="bg-gray-50 px-6 py-4 border-t">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">
            Total de productos: <strong>{productos.length}</strong>
          </span>
          <span className="text-gray-600">
            Productos activos: <strong>{productos.filter(p => p.activo).length}</strong>
          </span>
          <span className="text-red-600 font-semibold">
            Con stock bajo: <strong>{productos.filter(p => p.stock <= p.stockMinimo).length}</strong>
          </span>
        </div>
      </div>
    </div>
  );
};