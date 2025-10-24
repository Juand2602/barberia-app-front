// src/components/empleados/RegistrarPagoComisionModal.tsx

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Card } from '@components/ui/Card';
import { DollarSign, Calendar, TrendingUp, AlertCircle } from 'lucide-react';
import { Empleado, ComisionPendiente } from '@/types/empleado.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface RegistrarPagoComisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado;
  comisionPendiente: ComisionPendiente;
  onConfirm: (data: {
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
    referencia?: string;
    notas?: string;
    ajuste: number;
  }) => Promise<void>;
}

type MetodoPago = 'EFECTIVO' | 'TRANSFERENCIA';

interface FormValues {
  metodoPago: MetodoPago;
  referencia?: string;
  notas?: string;
  ajuste: string;
}

export const RegistrarPagoComisionModal: React.FC<RegistrarPagoComisionModalProps> = ({
  isOpen,
  onClose,
  empleado,
  comisionPendiente,
  onConfirm,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
  } = useForm<FormValues>({
    defaultValues: {
      metodoPago: 'EFECTIVO',
      referencia: '',
      notas: '',
      ajuste: '',
    },
  });

  const metodoPago = watch('metodoPago') as MetodoPago;
  const ajusteStr = watch('ajuste') || '0';
  const ajuste = parseFloat(ajusteStr) || 0;

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const montoFinal = comisionPendiente.montoComision + ajuste;

  const handleFormSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    try {
      await onConfirm({
        metodoPago: data.metodoPago,
        referencia: data.referencia,
        notas: data.notas,
        ajuste: parseFloat(data.ajuste) || 0,
      });
      onClose();
    } catch (error: any) {
      alert(error.message || 'Error al registrar el pago');
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Pago de Comisión"
      size="lg"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Info del empleado y periodo */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Empleado</p>
              <p className="font-semibold text-gray-900">{empleado.nombre}</p>
              <p className="text-sm text-gray-600 mt-1">
                Comisión: {empleado.porcentajeComision}%
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Periodo</p>
              <p className="text-sm font-semibold text-gray-900">
                {format(comisionPendiente.periodo.inicio, "dd MMM", {
                  locale: es,
                })}{" "}
                -{" "}
                {format(comisionPendiente.periodo.fin, "dd MMM yyyy", {
                  locale: es,
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Resumen de ventas */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Resumen del Periodo
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <TrendingUp className="text-green-600" size={18} />
                <span className="text-gray-600">Total de ventas</span>
              </div>
              <span className="font-semibold text-gray-900">
                {formatCurrency(comisionPendiente.totalVentas)}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <Calendar className="text-blue-600" size={18} />
                <span className="text-gray-600">Transacciones realizadas</span>
              </div>
              <span className="font-semibold text-gray-900">
                {comisionPendiente.cantidadTransacciones}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="flex items-center gap-2">
                <DollarSign className="text-purple-600" size={18} />
                <span className="text-gray-600">
                  Comisión calculada ({empleado.porcentajeComision}%)
                </span>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {formatCurrency(comisionPendiente.montoComision)}
              </span>
            </div>
          </div>
        </Card>

        {/* Ajuste (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Ajuste (opcional)
          </label>
          <div className="relative">
            <input
              type="number"
              step="10000"
              {...register("ajuste")}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Usa valores positivos para aumentar o negativos para descontar. Ej:
            -5000 para descontar $5.000
          </p>

          {ajuste !== 0 && (
            <div className="mt-2 p-2 bg-yellow-50 rounded flex items-start gap-2">
              <AlertCircle
                className="text-yellow-600 flex-shrink-0 mt-0.5"
                size={16}
              />
              <p className="text-xs text-yellow-700">
                {ajuste > 0 ? "Aumentando" : "Descontando"}{" "}
                {formatCurrency(Math.abs(ajuste))} al monto calculado
              </p>
            </div>
          )}
        </div>

        {/* Monto final a pagar */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Monto Total a Pagar</p>
              {ajuste !== 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  {formatCurrency(comisionPendiente.montoComision)}{" "}
                  {ajuste > 0 ? "+" : "-"} {formatCurrency(Math.abs(ajuste))}
                </p>
              )}
            </div>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(montoFinal)}
            </p>
          </div>
        </div>

        {/* Método de pago */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Método de Pago *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label
              className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${
                  metodoPago === "EFECTIVO"
                    ? "bg-green-50 border-green-500 text-green-900"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }
              `}
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
              className={`
                flex items-center justify-center gap-2 p-4 border-2 rounded-lg cursor-pointer transition-colors
                ${
                  metodoPago === "TRANSFERENCIA"
                    ? "bg-purple-50 border-purple-500 text-purple-900"
                    : "bg-white border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <input
                type="radio"
                value="TRANSFERENCIA"
                {...register("metodoPago")}
                className="w-4 h-4"
              />
              <span className="font-medium">Transferencia</span>
            </label>
          </div>
        </div>

        {/* Referencia (solo si es transferencia) */}
        {metodoPago === "TRANSFERENCIA" && (
          <Input
            label="Número de Referencia (opcional)"
            {...register("referencia")}
            error={errors.referencia?.message as string}
            placeholder="123456789"
          />
        )}

        {/* Notas */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notas (opcional)
          </label>
          <textarea
            {...register("notas")}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            placeholder="Agrega notas adicionales sobre este pago..."
          />
        </div>

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
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Confirmar Pago"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};