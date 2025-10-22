import React, { useState } from 'react';
import { Calculator, DollarSign } from 'lucide-react';
import { Button } from '@components/ui/Button';

type Props = {
  initial?: number;
  onSubmit: (montoInicial: number, notas?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export const AperturaForm: React.FC<Props> = ({ initial = 0, onSubmit, onCancel, isLoading = false }) => {
  // monto: number cuando hay valor, '' cuando está vacío (input vacío)
  const [monto, setMonto] = useState<number | ''>(initial ?? '');
  const [notas, setNotas] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const valor = monto === '' ? NaN : Number(monto);
    if (isNaN(valor) || valor < 0) {
      setError('Ingresa un monto inicial válido (mayor o igual a 0)');
      return;
    }

    onSubmit(valor, notas || undefined);
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
          Registra el monto inicial en efectivo con el que se abre la caja.
        </p>
      </div>

      {/* Monto inicial - grande, con ícono igual que en cierre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Monto inicial *</label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="number"
            step="1000"
            value={monto === '' ? '' : monto}
            onChange={(e) => {
              const v = e.target.value;
              setMonto(v === '' ? '' : Number(v));
            }}
            className="w-full pl-10 pr-3 py-3 text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="0"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Ingresa el monto en efectivo con el que inicia la jornada.
        </p>
      </div>

      {/* Monto de ejemplo / visual (opcional) */}
      {monto !== '' && (
        <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
          <p className="text-xs text-blue-900 font-medium mb-1">Monto registrable</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(Number(monto))}</p>
        </div>
      )}

      {/* Notas/Observaciones */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas (opcional)</label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
          placeholder="Motivo / referencia (opcional)"
        />
      </div>

      {/* Error */}
      {error && <div className="text-sm text-red-600">{error}</div>}

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
          {isLoading ? 'Guardando...' : 'Abrir caja'}
        </Button>
      </div>
    </form>
  );
};

export default AperturaForm;
