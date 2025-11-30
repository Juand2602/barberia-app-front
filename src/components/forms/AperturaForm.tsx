// src/components/forms/AperturaForm.tsx - CON TRANSFERENCIAS

import React, { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Button } from '@components/ui/Button';

type Props = {
  initialEfectivo?: number;
  initialTransferencia?: number;
  onSubmit: (montoEfectivo: number, montoTransferencia: number, notas?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const AperturaForm: React.FC<Props> = ({ 
  initialEfectivo = 0,
  initialTransferencia = 0,
  onSubmit, 
  onCancel, 
  isLoading = false 
}) => {
  const [montoEfectivo, setMontoEfectivo] = useState<number | ''>(initialEfectivo ?? '');
  const [montoTransferencia, setMontoTransferencia] = useState<number | ''>(initialTransferencia ?? '');
  const [notas, setNotas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { 
      style: 'currency', 
      currency: 'COP', 
      minimumFractionDigits: 0 
    }).format(amount);

  const calcularTotal = () => {
    const efectivo = montoEfectivo === '' ? 0 : Number(montoEfectivo);
    const transferencia = montoTransferencia === '' ? 0 : Number(montoTransferencia);
    return efectivo + transferencia;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const efectivo = montoEfectivo === '' ? 0 : Number(montoEfectivo);
    const transferencia = montoTransferencia === '' ? 0 : Number(montoTransferencia);

    if (isNaN(efectivo) || efectivo < 0) {
      setError('Ingresa un monto de efectivo válido (mayor o igual a 0)');
      return;
    }

    if (isNaN(transferencia) || transferencia < 0) {
      setError('Ingresa un monto de transferencia válido (mayor o igual a 0)');
      return;
    }

    if (efectivo === 0 && transferencia === 0) {
      setError('Debe ingresar al menos un monto (efectivo o transferencia)');
      return;
    }

    onSubmit(efectivo, transferencia, notas || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calculator size={20} />
          Apertura de Caja
        </h3>
        <p className="text-sm text-gray-600">
          Registra los montos iniciales en efectivo y transferencias con los que se abre la caja.
        </p>
      </div>

      {/* Monto Efectivo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💵 Efectivo Inicial *
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="number"
            step="1000"
            value={montoEfectivo === '' ? '' : montoEfectivo}
            onChange={(e) => {
              const v = e.target.value;
              setMontoEfectivo(v === '' ? '' : Number(v));
            }}
            className="w-full pl-10 pr-3 py-3 text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Monto en efectivo físico en caja
        </p>
      </div>

      {/* Monto Transferencias */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💳 Saldo Transferencias Inicial *
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="number"
            step="1000"
            value={montoTransferencia === '' ? '' : montoTransferencia}
            onChange={(e) => {
              const v = e.target.value;
              setMontoTransferencia(v === '' ? '' : Number(v));
            }}
            className="w-full pl-10 pr-3 py-3 text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Saldo inicial en cuenta para transferencias
        </p>
      </div>

      {/* Total combinado */}
      {(montoEfectivo !== '' || montoTransferencia !== '') && calcularTotal() > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
          <p className="text-xs text-blue-900 font-medium mb-1">Total en Caja</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(calcularTotal())}
          </p>
          <div className="flex gap-4 mt-2 text-xs text-blue-700">
            <span>💵 {formatCurrency(montoEfectivo === '' ? 0 : Number(montoEfectivo))}</span>
            <span>💳 {formatCurrency(montoTransferencia === '' ? 0 : Number(montoTransferencia))}</span>
          </div>
        </div>
      )}

      {/* Notas/Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas (opcional)
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          placeholder="Observaciones sobre la apertura..."
        />
      </div>

      {/* Error */}
      {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          className="bg-blue-600 hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? 'Guardando...' : 'Abrir Caja'}
        </Button>
      </div>
    </form>
  );
};

export default AperturaForm;