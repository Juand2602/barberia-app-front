// src/components/transacciones/RecibirPagoModal.tsx - ACTUALIZADO

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { DollarSign, Plus, Trash2 } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { Transaccion, TransaccionItemDTO, MarcarPagadaDTO } from '@/types/transaccion.types';
import { Servicio } from '@/types/servicio.types';
import { Empleado } from '@/types/empleado.types';
import { serviciosService } from '@services/servicios.service';
import { empleadosService } from '@services/empleados.service';

interface RecibirPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaccion: Transaccion;
  onConfirm: (transaccionId: string, data: MarcarPagadaDTO, itemsActualizados?: TransaccionItemDTO[], empleadoIdActualizado?: string) => Promise<void>;
}

interface ItemFormulario extends TransaccionItemDTO {
  tempId: string;
  nombreServicio?: string;
}

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

interface FormValues {
  metodoPago: MetodoPago;
  referencia?: string;
  empleadoId?: string;
}

export const RecibirPagoModal: React.FC<RecibirPagoModalProps> = ({
  isOpen,
  onClose,
  transaccion,
  onConfirm,
}) => {
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [items, setItems] = useState<ItemFormulario[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ NUEVA LÓGICA: Determinar el empleado predeterminado
  const getEmpleadoPredeterminado = (): string => {
    // 1. Si la transacción ya tiene empleado asignado, usar ese
    if (transaccion.empleadoId) {
      return transaccion.empleadoId;
    }
    
    // 2. Si viene de una cita, usar el empleado de la cita
    if (transaccion.cita?.empleadoId) {
      return transaccion.cita.empleadoId;
    }
    
    // 3. Si no hay ninguno, dejar vacío
    return '';
  };

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      metodoPago: 'EFECTIVO',
      referencia: '',
      empleadoId: '', // Se establecerá en el useEffect
    },
  });

  const metodoPago = (watch('metodoPago') ?? 'EFECTIVO') as MetodoPago;

  useEffect(() => {
    if (isOpen) {
      loadData();
      
      // Cargar items existentes
      setItems(
        transaccion.items.map((item, idx) => ({
          tempId: `${item.id}-${idx}`,
          servicioId: item.servicioId,
          cantidad: item.cantidad,
          precioUnitario: item.precioUnitario,
          subtotal: item.subtotal,
          nombreServicio: item.servicio.nombre,
        }))
      );
    }
  }, [isOpen, transaccion]);

  // ✅ ESTABLECER EL EMPLEADO PREDETERMINADO después de cargar empleados
  useEffect(() => {
    if (isOpen && empleados.length > 0) {
      const empleadoId = getEmpleadoPredeterminado();
      if (empleadoId) {
        setValue('empleadoId', empleadoId);
      }
    }
  }, [isOpen, empleados, transaccion]);

  const loadData = async () => {
    try {
      const [serviciosData, empleadosData] = await Promise.all([
        serviciosService.getAll(true),
        empleadosService.getAll(true),
      ]);
      setServicios(serviciosData);
      setEmpleados(empleadosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
    }
  };

  const agregarItem = () => {
    setItems(prev => [
      ...prev,
      {
        tempId: Date.now().toString(),
        servicioId: '',
        cantidad: 1,
        precioUnitario: 0,
        subtotal: 0,
      },
    ]);
  };

  const eliminarItem = (tempId: string) => {
    setItems(prev => prev.filter(item => item.tempId !== tempId));
  };

  const actualizarItem = (tempId: string, campo: keyof ItemFormulario, valor: any) => {
    setItems(prev =>
      prev.map(item => {
        if (item.tempId !== tempId) return item;

        const itemActualizado: ItemFormulario = { ...item, [campo]: valor };

        if (campo === 'servicioId') {
          const servicio = servicios.find(s => s.id === valor);
          if (servicio) {
            itemActualizado.precioUnitario = servicio.precio;
            itemActualizado.nombreServicio = servicio.nombre;
            itemActualizado.subtotal = servicio.precio * (itemActualizado.cantidad || 1);
          } else {
            itemActualizado.precioUnitario = 0;
            itemActualizado.subtotal = 0;
            itemActualizado.nombreServicio = undefined;
          }
        }

        if (campo === 'cantidad') {
          const cantidad = Number(valor) || 0;
          itemActualizado.cantidad = cantidad;
          itemActualizado.subtotal = cantidad * (itemActualizado.precioUnitario || 0);
        }

        if (campo === 'precioUnitario') {
          const precio = Number(valor) || 0;
          itemActualizado.precioUnitario = precio;
          itemActualizado.subtotal = precio * (itemActualizado.cantidad || 0);
        }

        return itemActualizado;
      })
    );
  };

  const calcularTotal = () => items.reduce((sum, item) => sum + (item.subtotal || 0), 0);

  const handleFormSubmit = async (data: FormValues) => {
    if (items.length === 0) {
      alert('Debe tener al menos un servicio');
      return;
    }

    if (items.some(item => !item.servicioId)) {
      alert('Todos los items deben tener un servicio seleccionado');
      return;
    }

    if (!data.empleadoId) {
      alert('Debe seleccionar un barbero');
      return;
    }

    setIsSubmitting(true);
    try {
      const pagoData: MarcarPagadaDTO = {
        metodoPago: data.metodoPago,
        referencia: data.metodoPago === 'TRANSFERENCIA' ? data.referencia : undefined,
      };

      const itemsDTO: TransaccionItemDTO[] = items.map(({ servicioId, cantidad, precioUnitario, subtotal }) => ({
        servicioId,
        cantidad,
        precioUnitario,
        subtotal,
      }));

      await onConfirm(transaccion.id, pagoData, itemsDTO, data.empleadoId);
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al procesar el pago');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Recibir Pago" size="xl">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Info de la cita */}
        {transaccion.cita && (
          <div className="bg-blue-50 p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cita asociada</p>
                <p className="font-semibold text-gray-900">{transaccion.cita.radicado}</p>
                <p className="text-sm text-gray-600">
                  {transaccion.cliente?.nombre} - {new Date(transaccion.cita.fechaHora).toLocaleString('es-CO', {
                    dateStyle: 'short',
                    timeStyle: 'short'
                  })}
                </p>
              </div>
              {transaccion.cita.empleado && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Barbero de la cita</p>
                  <p className="font-semibold text-blue-700">{transaccion.cita.empleado.nombre}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Empleado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Barbero que realizó el servicio *
          </label>
          <select
            {...register('empleadoId', { required: 'El barbero es requerido' })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Seleccionar barbero</option>
            {empleados.map((empleado) => (
              <option key={empleado.id} value={empleado.id}>
                {empleado.nombre}
              </option>
            ))}
          </select>
          {errors.empleadoId && (
            <p className="mt-1 text-sm text-red-600">{errors.empleadoId.message}</p>
          )}
        </div>

        {/* Servicios */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-900">Servicios</h3>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={agregarItem}
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Agregar Servicio
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.tempId}
                className="grid grid-cols-12 gap-3 p-3 bg-gray-50 rounded-lg items-end"
              >
                <div className="col-span-5">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servicio *
                  </label>
                  <select
                    value={item.servicioId}
                    onChange={(e) => actualizarItem(item.tempId, 'servicioId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Seleccionar</option>
                    {servicios.map((servicio) => (
                      <option key={servicio.id} value={servicio.id}>
                        {servicio.nombre} - ${servicio.precio.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cant.
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={item.cantidad}
                    onChange={(e) =>
                      actualizarItem(item.tempId, 'cantidad', parseInt(e.target.value || '1', 10))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Precio
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.precioUnitario}
                    onChange={(e) =>
                      actualizarItem(item.tempId, 'precioUnitario', parseFloat(e.target.value || '0'))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subtotal
                  </label>
                  <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 font-semibold">
                    ${item.subtotal.toLocaleString()}
                  </div>
                </div>

                <div className="col-span-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => eliminarItem(item.tempId)}
                    className="w-full"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">TOTAL A PAGAR:</span>
            <span className="text-3xl font-bold text-green-600">
              {formatCurrency(calcularTotal())}
            </span>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                metodoPago === 'EFECTIVO'
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
              <DollarSign size={20} />
              <span className="font-medium">Efectivo</span>
            </label>

            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                metodoPago === 'TRANSFERENCIA'
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

        {/* Referencia */}
        {metodoPago === 'TRANSFERENCIA' && (
          <Input
            label="Número de Referencia *"
            {...register('referencia', {
              required: metodoPago === 'TRANSFERENCIA' ? 'La referencia es requerida' : false,
            })}
            error={errors.referencia?.message}
            placeholder="123456789"
          />
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};