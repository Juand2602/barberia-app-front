import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Input } from '@components/ui/Input';
import { Button } from '@components/ui/Button';
import { HorarioSelector } from './HorarioSelector';
import { CreateEmpleadoDTO } from '@/types/empleado.types';

interface EmpleadoFormProps {
  initialData?: CreateEmpleadoDTO;
  onSubmit: (data: CreateEmpleadoDTO) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const especialidadesDisponibles = [
  'Corte de cabello',
  'Barba',
  'Cejas',
  'Afeitado',
  'Tinte',
  'Permanente',
];

export const EmpleadoForm: React.FC<EmpleadoFormProps> = ({
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
    control,
    watch,
  } = useForm<CreateEmpleadoDTO>({
    defaultValues: initialData || {
      especialidades: [],
      porcentajeComision: 50, // ✅ Valor por defecto
    },
  });

  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>(
    initialData?.especialidades || []
  );

  const porcentajeComision = watch('porcentajeComision');

  useEffect(() => {
    if (initialData) {
      reset(initialData);
      setSelectedEspecialidades(initialData.especialidades);
    }
  }, [initialData, reset]);

  const toggleEspecialidad = (esp: string) => {
    setSelectedEspecialidades(prev =>
      prev.includes(esp)
        ? prev.filter(e => e !== esp)
        : [...prev, esp]
    );
  };

  const handleFormSubmit = (data: any) => {
    onSubmit({
      ...data,
      especialidades: selectedEspecialidades,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Información básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>
        
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
          placeholder="Carlos Rodríguez"
        />

        <Input
          label="Teléfono *"
          {...register('telefono', {
            required: 'El teléfono es requerido',
            pattern: {
              value: /^[0-9+\s-]+$/,
              message: 'Teléfono inválido',
            },
            minLength: {
              value: 10,
              message: 'El teléfono debe tener al menos 10 dígitos',
            },
          })}
          error={errors.telefono?.message}
          placeholder="3001234567"
        />

        {/* ✅ NUEVO: Campo de porcentaje de comisión */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Porcentaje de Comisión * (%)
          </label>
          <div className="relative">
            <input
              type="number"
              min="0"
              max="100"
              step="0.5"
              {...register('porcentajeComision', {
                required: 'El porcentaje de comisión es requerido',
                min: {
                  value: 0,
                  message: 'El porcentaje no puede ser negativo',
                },
                max: {
                  value: 100,
                  message: 'El porcentaje no puede ser mayor a 100',
                },
                valueAsNumber: true,
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="50"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <span className="text-gray-500 text-sm">%</span>
            </div>
          </div>
          {errors.porcentajeComision && (
            <p className="mt-1 text-sm text-red-600">{errors.porcentajeComision.message}</p>
          )}
          <div className="mt-2 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-semibold">Distribución:</span>
            </p>
            <div className="mt-1 flex justify-between text-sm">
              <span className="text-gray-600">
                Empleado: <span className="font-semibold text-blue-600">{porcentajeComision || 0}%</span>
              </span>
              <span className="text-gray-600">
                Barbería: <span className="font-semibold text-green-600">{100 - (porcentajeComision || 0)}%</span>
              </span>
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Ejemplo: En una venta de $30.000, el empleado gana ${((30000 * (porcentajeComision || 0)) / 100).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Especialidades *
        </h3>
        <p className="text-sm text-gray-600">
          Selecciona los servicios que puede realizar
        </p>
        
        <div className="grid grid-cols-2 gap-3">
          {especialidadesDisponibles.map((esp) => (
            <label
              key={esp}
              className={`
                flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-colors
                ${selectedEspecialidades.includes(esp)
                  ? 'bg-blue-50 border-blue-500'
                  : 'bg-white border-gray-300 hover:border-gray-400'
                }
              `}
            >
              <input
                type="checkbox"
                checked={selectedEspecialidades.includes(esp)}
                onChange={() => toggleEspecialidad(esp)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">{esp}</span>
            </label>
          ))}
        </div>

        {selectedEspecialidades.length === 0 && (
          <p className="text-sm text-red-600">
            Debe seleccionar al menos una especialidad
          </p>
        )}
      </div>

      {/* Horarios */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">
          Horarios de Trabajo
        </h3>
        <p className="text-sm text-gray-600">
          Define los días y horarios en que trabaja
        </p>

        <div className="space-y-2">
          <Controller
            name="horarioLunes"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Lunes"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioMartes"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Martes"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioMiercoles"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Miércoles"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioJueves"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Jueves"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioViernes"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Viernes"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioSabado"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Sábado"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            name="horarioDomingo"
            control={control}
            render={({ field }) => (
              <HorarioSelector
                dia="Domingo"
                value={field.value || null}
                onChange={field.onChange}
              />
            )}
          />
        </div>
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
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || selectedEspecialidades.length === 0}
        >
          {isLoading ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
};