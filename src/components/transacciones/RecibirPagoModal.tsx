// src/components/transacciones/RecibirPagoModal.tsx - ACTUALIZADO CON PAGO MIXTO

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

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA' | 'MIXTO'; // ✅ AGREGAR MIXTO

interface FormValues {
  metodoPago: MetodoPago;
  referencia?: string;
  empleadoId?: string;
  montoEfectivo?: number;      // ✅ NUEVO
  montoTransferencia?: number; // ✅ NUEVO
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

  const getEmpleadoPredeterminado = (): string => {
    if (transaccion.empleadoId) {
      return transaccion.empleadoId;
    }
    if (transaccion.cita?.empleadoId) {
      return transaccion.cita.empleadoId;
    }
    return '';
  };

  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormValues>({
    defaultValues: {
      metodoPago: 'EFECTIVO',
      referencia: '',
      empleadoId: '',
      montoEfectivo: undefined,
      montoTransferencia: undefined,
    },
  });

  const metodoPago = (watch('metodoPago') ?? 'EFECTIVO') as MetodoPago;
  const montoEfectivo = watch('montoEfectivo') || 0;
  const montoTransferencia = watch('montoTransferencia') || 0;

  useEffect(() => {
    if (isOpen) {
      loadData();
      
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

    // ✅ VALIDACIÓN PARA PAGO MIXTO
    if (data.metodoPago === 'MIXTO') {
      const total = calcularTotal();
      const efectivo = data.montoEfectivo || 0;
      const transferencia = data.montoTransferencia || 0;

      if (efectivo <= 0 || transferencia <= 0) {
        alert('Para pago mixto, debe especificar montos mayores a cero en efectivo y transferencia');
        return;
      }

      if (Math.abs((efectivo + transferencia) - total) > 0.01) {
        alert(
          `La suma de efectivo ($${efectivo.toLocaleString()}) y transferencia ($${transferencia.toLocaleString()}) debe ser igual al total ($${total.toLocaleString()})`
        );
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const pagoData: MarcarPagadaDTO = {
        metodoPago: data.metodoPago,
        referencia: (data.metodoPago === 'TRANSFERENCIA' || data.metodoPago === 'MIXTO') ? data.referencia : undefined,
        // ✅ NUEVO: Incluir montos solo si es pago mixto
        montoEfectivo: data.metodoPago === 'MIXTO' ? data.montoEfectivo : undefined,
        montoTransferencia: data.metodoPago === 'MIXTO' ? data.montoTransferencia : undefined,
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
                <p className="font-semibold text-gray-900">
                  {transaccion.cita.radicado}
                </p>
                <p className="text-sm text-gray-600">
                  {transaccion.cliente?.nombre} -{" "}
                  {new Date(transaccion.cita.fechaHora).toLocaleString(
                    "es-CO",
                    {
                      dateStyle: "short",
                      timeStyle: "short",
                    }
                  )}
                </p>
              </div>
              {transaccion.cita.empleado && (
                <div className="text-right">
                  <p className="text-sm text-gray-600">Barbero de la cita</p>
                  <p className="font-semibold text-blue-700">
                    {transaccion.cita.empleado.nombre}
                  </p>
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
            {...register("empleadoId", { required: "El barbero es requerido" })}
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
            <p className="mt-1 text-sm text-red-600">
              {errors.empleadoId.message}
            </p>
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
                    onChange={(e) =>
                      actualizarItem(item.tempId, "servicioId", e.target.value)
                    }
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
                      actualizarItem(
                        item.tempId,
                        "cantidad",
                        parseInt(e.target.value || "1", 10)
                      )
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
                      actualizarItem(
                        item.tempId,
                        "precioUnitario",
                        parseFloat(e.target.value || "0")
                      )
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
            <span className="text-lg font-semibold text-gray-900">
              TOTAL A PAGAR:
            </span>
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
          <div className="grid grid-cols-3 gap-3">
            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                metodoPago === "EFECTIVO"
                  ? "bg-green-50 border-green-500 text-green-900"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                value="EFECTIVO"
                {...register("metodoPago")}
                className="w-4 h-4"
              />
              <DollarSign size={20} />
              <span className="font-medium">Efectivo</span>
            </label>

            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                metodoPago === "TRANSFERENCIA"
                  ? "bg-purple-50 border-purple-500 text-purple-900"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                value="TRANSFERENCIA"
                {...register("metodoPago")}
                className="w-4 h-4"
              />
              <span className="font-medium">Transferencia</span>
            </label>

            {/* ✅ NUEVO: Opción pago mixto */}
            <label
              className={`flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                metodoPago === "MIXTO"
                  ? "bg-blue-50 border-blue-500 text-blue-900"
                  : "bg-white border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                type="radio"
                value="MIXTO"
                {...register("metodoPago")}
                className="w-4 h-4"
              />
              <DollarSign size={20} />
              <span className="font-medium">Mixto</span>
            </label>
          </div>
        </div>

        {/* ✅ NUEVO: Campos para pago mixto */}
        {metodoPago === 'MIXTO' && (
          <div className="bg-amber-50 p-4 rounded-lg space-y-4 border-2 border-amber-200">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <DollarSign size={18} />
              Desglose de Pago Mixto
            </h4>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto en Efectivo *
                </label>
                <input
                  type="number"
                  step="1000"
                  {...register('montoEfectivo', {
                    required: metodoPago === 'MIXTO',
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto en Transferencia *
                </label>
                <input
                  type="number"
                  step="1000"
                  {...register('montoTransferencia', {
                    required: metodoPago === 'MIXTO',
                    valueAsNumber: true,
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Verificación visual */}
            <div className="bg-white p-3 rounded-lg border border-amber-300">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">Total a pagar:</span>
                <span className="font-bold">${calcularTotal().toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-600">Efectivo + Transferencia:</span>
                <span
                  className={`font-bold ${
                    Math.abs(montoEfectivo + montoTransferencia - calcularTotal()) < 0.01
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}
                >
                  ${(montoEfectivo + montoTransferencia).toLocaleString()}
                </span>
              </div>
              {Math.abs(montoEfectivo + montoTransferencia - calcularTotal()) >= 0.01 && (
                <p className="text-xs text-red-600 mt-2">⚠️ La suma debe ser igual al total</p>
              )}
            </div>
          </div>
        )}

        {/* Referencia */}
        {(metodoPago === "TRANSFERENCIA" || metodoPago === "MIXTO") && (
          <Input
            label="Número de Referencia"
            {...register("referencia")}
            error={errors.referencia?.message as string}
            placeholder="123456789"
          />
        )}

        {/* Botones */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="bg-green-600 hover:bg-green-700"
            disabled={isSubmitting || items.length === 0}
          >
            {isSubmitting ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};