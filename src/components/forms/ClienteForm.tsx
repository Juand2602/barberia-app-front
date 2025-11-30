// src/components/forms/ClienteForm.tsx - ACTUALIZADO

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { CreateClienteDTO } from '@/types/cliente.types';

interface ClienteFormProps {
  initialData?: CreateClienteDTO;
  onSubmit: (data: CreateClienteDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClienteForm: React.FC<ClienteFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
  } = useForm<CreateClienteDTO>({
    defaultValues: initialData || {
      nombre: '',
      telefono: '57', // ✅ Prefijo por defecto
      email: '',
      notas: '',
    },
  });


  useEffect(() => {
    if (initialData) {
      reset(initialData);
    } else {
      // ✅ Asegurar que siempre inicie con "57" en nuevos clientes
      setValue('telefono', '57');
    }
  }, [initialData, reset, setValue]);

  // ✅ Evitar que se borre el prefijo "57"
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Si el usuario intenta borrar el "57", lo restauramos
    if (!value.startsWith('57')) {
      setValue('telefono', '57');
      return;
    }
    
    // Permitir solo números después del prefijo
    const numeros = value.slice(2).replace(/\D/g, '');
    setValue('telefono', '57' + numeros);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Nombre completo *"
        {...register('nombre', {
          required: 'El nombre es requerido',
          minLength: {
            value: 3,
            message: 'El nombre debe tener al menos 3 caracteres',
          },
        })}
        error={errors.nombre?.message}
        placeholder="Juan Pérez"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Teléfono *
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 font-medium">+</span>
          </div>
          <input
            type="text"
            {...register('telefono', {
              required: 'El teléfono es requerido',
              minLength: {
                value: 12, // 57 + 10 dígitos
                message: 'El teléfono debe tener 10 dígitos después del 57',
              },
              maxLength: {
                value: 12,
                message: 'El teléfono no puede tener más de 10 dígitos',
              },
              pattern: {
                value: /^57[0-9]{10}$/,
                message: 'Formato: 57 + 10 dígitos (ej: 573001234567)',
              },
            })}
            onChange={handleTelefonoChange}
            className={`w-full pl-7 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.telefono ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="573001234567"
          />
        </div>
        {errors.telefono && (
          <p className="text-red-500 text-sm mt-1">{errors.telefono.message}</p>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Formato: +57 seguido de 10 dígitos (ej: 573001234567)
        </p>
      </div>

      <Input
        label="Email (opcional)"
        type="email"
        {...register('email', {
          pattern: {
            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            message: 'Email inválido',
          },
        })}
        error={errors.email?.message}
        placeholder="juan@example.com"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          {...register('notas')}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Información adicional del cliente..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-4">
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
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};