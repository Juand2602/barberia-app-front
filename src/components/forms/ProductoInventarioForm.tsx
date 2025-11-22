// src/components/forms/ProductoInventarioForm.tsx

import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import {
  ProductoInventario,
  CATEGORIAS_INVENTARIO,
  UNIDADES_MEDIDA,
  CategoriaInventario,
  UnidadMedida,
} from '@/types/inventario.types';

interface ProductoInventarioFormProps {
  producto?: ProductoInventario;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

type FormValues = {
  nombre: string;
  categoria: CategoriaInventario;
  precioCompra: number;
  precioVenta: number;
  stock: number;
  stockMinimo: number;
  unidadMedida: UnidadMedida;
};

export const ProductoInventarioForm: React.FC<ProductoInventarioFormProps> = ({
  producto,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormValues>({
    defaultValues: producto
      ? {
          nombre: producto.nombre,
          categoria: producto.categoria,
          precioCompra: producto.precioCompra,
          precioVenta: producto.precioVenta,
          stock: producto.stock,
          stockMinimo: producto.stockMinimo,
          unidadMedida: producto.unidadMedida,
        }
      : {
          nombre: '',
          categoria: 'Bebidas',
          precioCompra: undefined, // Se mantiene undefined para que no aparezca un valor inicial
          precioVenta: undefined,
          stock: undefined,
          stockMinimo: undefined,
          unidadMedida: 'Unidad',
        },
  });

  const precioCompra = watch('precioCompra');
  const precioVenta = watch('precioVenta');
  const margen = precioVenta && precioCompra 
    ? ((precioVenta - precioCompra) / precioVenta * 100).toFixed(1)
    : '0';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Nombre */}
      <Input
        label="Nombre del Producto *"
        {...register('nombre', {
          required: 'El nombre es obligatorio',
          minLength: { value: 2, message: 'Mínimo 2 caracteres' },
        })}
        error={errors.nombre?.message}
        placeholder="Ej: Coca-Cola 350ml"
      />

      {/* Categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Categoría *
        </label>
        <select
          {...register('categoria', { required: 'La categoría es obligatoria' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {CATEGORIAS_INVENTARIO.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.categoria && (
          <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>
        )}
      </div>

      {/* Precios */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Precio de Compra *"
          type="number"
          step="1"
          {...register('precioCompra', {
            required: 'El precio de compra es obligatorio',
            min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            valueAsNumber: true,
          })}
          error={errors.precioCompra?.message}
          placeholder="10000"
        />

        <Input
          label="Precio de Venta *"
          type="number"
          step="1"
          {...register('precioVenta', {
            required: 'El precio de venta es obligatorio',
            min: { value: 0, message: 'Debe ser mayor o igual a 0' },
            valueAsNumber: true,
          })}
          error={errors.precioVenta?.message}
          placeholder="15000"
        />
      </div>

      {/* Margen de Ganancia */}
      {precioVenta > 0 && (
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-700">Margen de ganancia:</span>
            <span className={`text-lg font-bold ${
              Number(margen) >= 30 ? 'text-green-600' : 
              Number(margen) >= 15 ? 'text-yellow-600' : 
              'text-red-600'
            }`}>
              {margen}%
            </span>
          </div>
          {Number(margen) < 15 && (
            <p className="text-xs text-red-600 mt-1">
              ⚠️ Margen bajo. Considera ajustar el precio de venta.
            </p>
          )}
        </div>
      )}

      {/* Stock */}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Stock Inicial"
          type="number"
          {...register('stock', {
            min: { value: 0, message: 'No puede ser negativo' },
            valueAsNumber: true,
          })}
          error={errors.stock?.message}
          placeholder="50"
          disabled={!!producto} // No editable si es actualización
        />

        <Input
          label="Stock Mínimo *"
          type="number"
          {...register('stockMinimo', {
            required: 'El stock mínimo es obligatorio',
            min: { value: 1, message: 'Debe ser al menos 1' },
            valueAsNumber: true,
          })}
          error={errors.stockMinimo?.message}
          placeholder="10"
        />
      </div>

      {/* Unidad de Medida */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unidad de Medida *
        </label>
        <select
          {...register('unidadMedida', { required: 'La unidad es obligatoria' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {UNIDADES_MEDIDA.map((unidad) => (
            <option key={unidad} value={unidad}>
              {unidad}
            </option>
          ))}
        </select>
        {errors.unidadMedida && (
          <p className="mt-1 text-sm text-red-600">{errors.unidadMedida.message}</p>
        )}
      </div>

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
        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading
            ? 'Guardando...'
            : producto
            ? 'Actualizar Producto'
            : 'Crear Producto'}
        </Button>
      </div>
    </form>
  );
};