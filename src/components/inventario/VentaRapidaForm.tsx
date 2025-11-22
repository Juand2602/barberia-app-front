// src/components/inventario/VentaRapidaForm.tsx

import React, {useState } from 'react';
import { useForm } from 'react-hook-form';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { ProductoInventario } from '@/types/inventario.types';

interface VentaRapidaFormProps {
  productos: ProductoInventario[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

interface ItemVenta {
  productoId: string;
  producto: ProductoInventario;
  cantidad: number;
  subtotal: number;
}

type FormValues = {
  metodoPago: string;
  notas?: string;
};

export const VentaRapidaForm: React.FC<VentaRapidaFormProps> = ({
  productos,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [items, setItems] = useState<ItemVenta[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState('');

  const { register, handleSubmit, watch } = useForm<FormValues>({
    defaultValues: {
      metodoPago: 'EFECTIVO',
      notas: '',
    },
  });

  const agregarProducto = () => {
    if (!productoSeleccionado) return;

    const producto = productos.find((p) => p.id === productoSeleccionado);
    if (!producto) return;

    // Verificar si ya existe en el carrito
    const existente = items.find((item) => item.productoId === producto.id);
    if (existente) {
      incrementarCantidad(producto.id);
      return;
    }

    const nuevoItem: ItemVenta = {
      productoId: producto.id,
      producto,
      cantidad: 1,
      subtotal: producto.precioVenta,
    };

    setItems([...items, nuevoItem]);
    setProductoSeleccionado('');
  };

  const incrementarCantidad = (productoId: string) => {
    setItems(
      items.map((item) => {
        if (item.productoId !== productoId) return item;

        const nuevaCantidad = item.cantidad + 1;
        if (nuevaCantidad > item.producto.stock) {
          alert(`Stock insuficiente. Disponible: ${item.producto.stock}`);
          return item;
        }

        return {
          ...item,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * item.producto.precioVenta,
        };
      })
    );
  };

  const decrementarCantidad = (productoId: string) => {
    setItems(
      items.map((item) => {
        if (item.productoId !== productoId) return item;

        const nuevaCantidad = Math.max(1, item.cantidad - 1);
        return {
          ...item,
          cantidad: nuevaCantidad,
          subtotal: nuevaCantidad * item.producto.precioVenta,
        };
      })
    );
  };

  const eliminarItem = (productoId: string) => {
    setItems(items.filter((item) => item.productoId !== productoId));
  };

  const calcularTotal = () => items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleFormSubmit = (data: FormValues) => {
    if (items.length === 0) {
      alert('Agrega al menos un producto');
      return;
    }

    // Crear una venta por cada producto
    const ventas = items.map((item) => ({
      productoId: item.productoId,
      cantidad: item.cantidad,
      metodoPago: data.metodoPago,
      notas: data.notas,
    }));

    onSubmit(ventas);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Selector de producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agregar Producto
        </label>
        <div className="flex gap-2">
          <select
            value={productoSeleccionado}
            onChange={(e) => setProductoSeleccionado(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar producto...</option>
            {productos
              .filter((p) => p.activo && p.stock > 0)
              .map((producto) => (
                <option key={producto.id} value={producto.id}>
                  {producto.nombre} - {formatCurrency(producto.precioVenta)} (Stock: {producto.stock})
                </option>
              ))}
          </select>
          <Button
            type="button"
            variant="primary"
            onClick={agregarProducto}
            disabled={!productoSeleccionado}
          >
            <ShoppingCart size={20} />
          </Button>
        </div>
      </div>

      {/* Carrito */}
      {items.length > 0 ? (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h4 className="font-semibold text-gray-900">Carrito de Venta</h4>
          </div>
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.productoId} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{item.producto.nombre}</p>
                  <p className="text-sm text-gray-600">
                    {formatCurrency(item.producto.precioVenta)} x {item.cantidad}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                    <button
                      type="button"
                      onClick={() => decrementarCantidad(item.productoId)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-8 text-center font-semibold">{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => incrementarCantidad(item.productoId)}
                      className="p-1 hover:bg-gray-200 rounded"
                      disabled={item.cantidad >= item.producto.stock}
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span className="font-bold text-gray-900 w-24 text-right">
                    {formatCurrency(item.subtotal)}
                  </span>
                  <button
                    type="button"
                    onClick={() => eliminarItem(item.productoId)}
                    className="text-red-600 hover:text-red-800"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-green-50 p-4 border-t-2 border-green-500">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">TOTAL:</span>
              <span className="text-3xl font-bold text-green-600">
                {formatCurrency(calcularTotal())}
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <ShoppingCart className="mx-auto text-gray-400 mb-2" size={48} />
          <p className="text-gray-500">El carrito está vacío</p>
          <p className="text-sm text-gray-400 mt-1">Agrega productos para comenzar la venta</p>
        </div>
      )}

      {/* Método de pago */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Método de Pago *
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label
            className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              watch('metodoPago') === 'EFECTIVO'
                ? 'bg-green-50 border-green-500 text-green-900'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              value="EFECTIVO"
              {...register('metodoPago')}
              className="w-4 h-4"
            />
            <span className="font-medium">Efectivo</span>
          </label>

          <label
            className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
              watch('metodoPago') === 'TRANSFERENCIA'
                ? 'bg-purple-50 border-purple-500 text-purple-900'
                : 'bg-white border-gray-300 hover:border-gray-400'
            }`}
          >
            <input
              type="radio"
              value="TRANSFERENCIA"
              {...register('metodoPago')}
              className="w-4 h-4"
            />
            <span className="font-medium">Transferencia</span>
          </label>
        </div>
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional..."
        />
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-green-600 hover:bg-green-700"
          disabled={isLoading || items.length === 0}
        >
          {isLoading ? 'Registrando...' : 'Completar Venta'}
        </Button>
      </div>
    </form>
  );
};