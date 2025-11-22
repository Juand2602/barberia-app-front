// src/components/inventario/StockAlerts.tsx

import React from 'react';
import { AlertTriangle, Package, ShoppingCart, TrendingDown } from 'lucide-react';
import { ProductoInventario } from '@/types/inventario.types';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';

interface StockAlertsProps {
  productos: ProductoInventario[];
  onComprar?: (producto: ProductoInventario) => void;
  onVerTodos?: () => void;
}

export const StockAlerts: React.FC<StockAlertsProps> = ({
  productos,
  onComprar,
  onVerTodos,
}) => {
  if (productos.length === 0) {
    return (
      <Card className="p-6 bg-green-50 border-green-200">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-green-100 rounded-full">
            <Package className="text-green-600" size={24} />
          </div>
          <div>
            <h3 className="font-semibold text-green-900">¡Todo en orden!</h3>
            <p className="text-sm text-green-700 mt-1">
              Todos los productos tienen stock suficiente
            </p>
          </div>
        </div>
      </Card>
    );
  }

  const productosSinStock = productos.filter(p => p.stock === 0);
  const productosStockBajo = productos.filter(p => p.stock > 0 && p.stock <= p.stockMinimo);

  return (
    <div className="space-y-4">
      {/* Alerta principal */}
      <Card className="p-4 bg-red-50 border-red-200">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-red-100 rounded-full flex-shrink-0">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">
                ⚠️ Alertas de Inventario
              </h3>
              <div className="space-y-1 text-sm text-red-800">
                {productosSinStock.length > 0 && (
                  <p>• {productosSinStock.length} producto{productosSinStock.length !== 1 ? 's' : ''} sin stock</p>
                )}
                {productosStockBajo.length > 0 && (
                  <p>• {productosStockBajo.length} producto{productosStockBajo.length !== 1 ? 's' : ''} con stock bajo</p>
                )}
              </div>
            </div>
          </div>
          {onVerTodos && (
            <Button
              size="sm"
              variant="secondary"
              onClick={onVerTodos}
              className="flex-shrink-0"
            >
              Ver Todos
            </Button>
          )}
        </div>
      </Card>

      {/* Productos sin stock */}
      {productosSinStock.length > 0 && (
        <Card className="overflow-hidden">
          <div className="bg-red-600 text-white px-4 py-2 flex items-center gap-2">
            <TrendingDown size={20} />
            <h4 className="font-semibold">Sin Stock - Urgente</h4>
          </div>
          <div className="divide-y">
            {productosSinStock.slice(0, 5).map((producto) => (
              <div
                key={producto.id}
                className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="p-2 bg-red-100 rounded">
                    <Package className="text-red-600" size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{producto.nombre}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                      <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                        {producto.categoria}
                      </span>
                      <span className="text-red-600 font-semibold">
                        Stock: 0 {producto.unidadMedida}
                      </span>
                    </div>
                  </div>
                </div>
                {onComprar && (
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onComprar(producto)}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700"
                  >
                    <ShoppingCart size={16} />
                    Comprar
                  </Button>
                )}
              </div>
            ))}
          </div>
          {productosSinStock.length > 5 && (
            <div className="bg-gray-50 px-4 py-2 text-center text-sm text-gray-600">
              ... y {productosSinStock.length - 5} producto{productosSinStock.length - 5 !== 1 ? 's' : ''} más sin stock
            </div>
          )}
        </Card>
      )}
    </div>
  );
};