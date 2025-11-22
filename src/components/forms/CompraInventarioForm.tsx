// src/components/forms/CompraInventarioForm.tsx

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Package, TrendingUp } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { ProductoInventario } from '@/types/inventario.types';
import { inventarioService } from '@services/inventario.service';

interface CompraInventarioFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormValues = {
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  proveedor?: string;
  factura?: string;
  notas?: string;
};

export const CompraInventarioForm: React.FC<CompraInventarioFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState<ProductoInventario | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormValues>({
    defaultValues: {
      productoId: '',
      cantidad: 1,
      precioUnitario: 0,
      proveedor: '',
      factura: '',
      notas: '',
    },
  });

  useEffect(() => {
    loadProductos();
  }, []);

  const loadProductos = async () => {
    try {
      const data = await inventarioService.getAllProductos({ activo: true });
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const productoId = watch('productoId');
  const cantidad = watch('cantidad') || 0;
  const precioUnitario = watch('precioUnitario') || 0;

  useEffect(() => {
    const producto = productos.find((p) => p.id === productoId);
    setProductoSeleccionado(producto || null);
    
    if (producto) {
      // Pre-llenar con el último precio de compra
      setValue('precioUnitario', producto.precioCompra);
    }
  }, [productoId, productos]);

  const calcularTotal = () => cantidad * precioUnitario;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Producto */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Producto *
        </label>
        <select
          {...register('productoId', { required: 'El producto es obligatorio' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Seleccionar producto...</option>
          {productos.map((producto) => (
            <option key={producto.id} value={producto.id}>
              {producto.nombre} - Stock actual: {producto.stock} {producto.unidadMedida}
            </option>
          ))}
        </select>
        {errors.productoId && (
          <p className="mt-1 text-sm text-red-600">{errors.productoId.message}</p>
        )}
      </div>

      {/* Info del producto seleccionado */}
      {productoSeleccionado && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center gap-3 mb-3">
            <Package className="text-blue-600" size={24} />
            <div>
              <p className="font-semibold text-gray-900">{productoSeleccionado.nombre}</p>
              <p className="text-sm text-gray-600">{productoSeleccionado.categoria}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Stock actual:</p>
              <p className="font-bold text-lg text-blue-600">
                {productoSeleccionado.stock} {productoSeleccionado.unidadMedida}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Precio compra anterior:</p>
              <p className="font-semibold text-gray-900">
                {formatCurrency(productoSeleccionado.precioCompra)}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Precio venta:</p>
              <p className="font-semibold text-green-600">
                {formatCurrency(productoSeleccionado.precioVenta)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Cantidad y Precio */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cantidad *"
          type="number"
          min="1"
          {...register('cantidad', {
            required: 'La cantidad es obligatoria',
            min: { value: 1, message: 'Debe ser al menos 1' },
            valueAsNumber: true,
          })}
          error={errors.cantidad?.message}
          placeholder="1"
        />

        <Input
          label="Precio Unitario *"
          type="number"
          step="1"
          min="0"
          {...register('precioUnitario', {
            required: 'El precio es obligatorio',
            min: { value: 0, message: 'No puede ser negativo' },
            valueAsNumber: true,
          })}
          error={errors.precioUnitario?.message}
          placeholder="0"
        />
      </div>

      {/* Total */}
      <div className="bg-green-50 p-4 rounded-lg border-2 border-green-500">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="text-green-600" size={24} />
            <span className="text-lg font-semibold text-gray-900">Total de Compra:</span>
          </div>
          <span className="text-3xl font-bold text-green-600">
            {formatCurrency(calcularTotal())}
          </span>
        </div>
        {productoSeleccionado && cantidad > 0 && (
          <div className="mt-2 pt-2 border-t border-green-200">
            <p className="text-sm text-gray-700">
              Nuevo stock: <strong className="text-green-700">
                {productoSeleccionado.stock + cantidad} {productoSeleccionado.unidadMedida}
              </strong>
            </p>
          </div>
        )}
      </div>

      {/* Proveedor y Factura */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Proveedor (opcional)"
          {...register('proveedor')}
          placeholder="Nombre del proveedor"
        />

        <Input
          label="Número de Factura (opcional)"
          {...register('factura')}
          placeholder="FAC-123456"
        />
      </div>

      {/* Notas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional sobre la compra..."
        />
      </div>

      {/* Advertencia de precio diferente */}
      {productoSeleccionado && 
       precioUnitario > 0 && 
       Math.abs(precioUnitario - productoSeleccionado.precioCompra) > 100 && (
        <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <p className="text-sm text-yellow-800">
            ⚠️ El precio de compra es diferente al anterior. El sistema actualizará el precio base del producto.
          </p>
        </div>
      )}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button
          type="button"
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading}
        >
          {isLoading ? 'Registrando...' : 'Registrar Compra'}
        </Button>
      </div>
    </form>
  );
};