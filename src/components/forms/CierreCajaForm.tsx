// src/components/forms/CierreCajaForm.tsx - CON TRANSFERENCIAS

import React, { useState } from 'react';
import { Calculator, DollarSign, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { DatosCierre } from '@/types/cierrecaja.types';

interface CierreCajaFormProps {
  datos: DatosCierre;
  onSubmit: (efectivoFinal: number, transferenciasFinal: number, notas?: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const CierreCajaForm: React.FC<CierreCajaFormProps> = ({
  datos,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [efectivoFinal, setEfectivoFinal] = useState<number>(datos.efectivoEsperado);
  const [transferenciasFinal, setTransferenciasFinal] = useState<number>(datos.transferenciasEsperadas || 0);
  const [notas, setNotas] = useState<string>('');

  const diferenciaEfectivo = efectivoFinal - datos.efectivoEsperado;
  const diferenciaTransferencias = transferenciasFinal - (datos.transferenciasEsperadas || 0);
  const diferenciaTotal = diferenciaEfectivo + diferenciaTransferencias;
  
  const diferenciaSignificativa = Math.abs(diferenciaTotal) > 20000;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (diferenciaSignificativa && !notas.trim()) {
      alert('Debe proporcionar una justificación para diferencias mayores a $20,000');
      return;
    }

    onSubmit(efectivoFinal, transferenciasFinal, notas || undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Resumen de Transacciones */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Calculator size={20} />
          Resumen del Día
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">💵 Efectivo Inicial</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(datos.efectivoInicial)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">💳 Transferencias Inicial</p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(datos.transferenciasInicial || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp size={14} className="text-green-600" />
              Ingresos en Efectivo
            </p>
            <p className="text-lg font-bold text-green-600">
              +{formatCurrency(datos.ingresosEfectivo)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingUp size={14} className="text-purple-600" />
              Ingresos en Transferencias
            </p>
            <p className="text-lg font-bold text-purple-600">
              +{formatCurrency(datos.ingresosTransferencias || 0)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingDown size={14} className="text-red-600" />
              Egresos en Efectivo
            </p>
            <p className="text-lg font-bold text-red-600">
              -{formatCurrency(datos.egresosEfectivo)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              <TrendingDown size={14} className="text-orange-600" />
              Egresos en Transferencias
            </p>
            <p className="text-lg font-bold text-orange-600">
              -{formatCurrency(datos.egresosTransferencias || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Montos Esperados */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <p className="text-sm text-green-900 font-medium mb-1">💵 Efectivo Esperado</p>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(datos.efectivoEsperado)}
          </p>
          <p className="text-xs text-green-700 mt-1">
            Inicial + Ingresos - Egresos
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
          <p className="text-sm text-purple-900 font-medium mb-1">💳 Transferencias Esperadas</p>
          <p className="text-2xl font-bold text-purple-600">
            {formatCurrency(datos.transferenciasEsperadas || 0)}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Inicial + Ingresos - Egresos
          </p>
        </div>
      </div>

      {/* Efectivo Contado */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💵 Efectivo Físico Contado *
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="number"
            step="1000"
            value={efectivoFinal}
            onChange={(e) => setEfectivoFinal(parseFloat(e.target.value) || 0)}
            className="w-full pl-10 pr-3 py-3 text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
            placeholder="0"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Efectivo físico que hay en la caja
        </p>
      </div>

      {/* Transferencias Contadas */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          💳 Saldo Transferencias Contado *
        </label>
        <div className="relative">
          <DollarSign
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="number"
            step="1000"
            value={transferenciasFinal}
            onChange={(e) => setTransferenciasFinal(parseFloat(e.target.value) || 0)}
            className="w-full pl-10 pr-3 py-3 text-xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
            placeholder="0"
            required
          />
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Saldo real en cuenta de transferencias
        </p>
      </div>

      {/* Diferencias */}
      {(efectivoFinal !== datos.efectivoEsperado || transferenciasFinal !== (datos.transferenciasEsperadas || 0)) && (
        <div className="space-y-3">
          {/* Diferencia Efectivo */}
          {diferenciaEfectivo !== 0 && (
            <div
              className={`p-3 rounded-lg border-2 ${
                diferenciaEfectivo >= 0
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">
                  💵 Diferencia Efectivo
                </p>
                <p
                  className={`text-xl font-bold ${
                    diferenciaEfectivo >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {diferenciaEfectivo >= 0 ? '+' : ''}
                  {formatCurrency(diferenciaEfectivo)}
                </p>
              </div>
            </div>
          )}

          {/* Diferencia Transferencias */}
          {diferenciaTransferencias !== 0 && (
            <div
              className={`p-3 rounded-lg border-2 ${
                diferenciaTransferencias >= 0
                  ? 'bg-purple-50 border-purple-300'
                  : 'bg-orange-50 border-orange-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <p className="font-semibold text-gray-900 text-sm">
                  💳 Diferencia Transferencias
                </p>
                <p
                  className={`text-xl font-bold ${
                    diferenciaTransferencias >= 0 ? 'text-purple-600' : 'text-orange-600'
                  }`}
                >
                  {diferenciaTransferencias >= 0 ? '+' : ''}
                  {formatCurrency(diferenciaTransferencias)}
                </p>
              </div>
            </div>
          )}

          {/* Diferencia Total */}
          <div
            className={`p-4 rounded-lg border-2 ${
              diferenciaTotal >= 0
                ? 'bg-green-50 border-green-300'
                : 'bg-red-50 border-red-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {diferenciaSignificativa && (
                <AlertCircle className="text-yellow-600" size={20} />
              )}
              <p className="font-semibold text-gray-900">
                Diferencia Total {diferenciaTotal >= 0 ? '(Sobrante)' : '(Faltante)'}
              </p>
            </div>
            <p
              className={`text-3xl font-bold ${
                diferenciaTotal >= 0 ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {diferenciaTotal >= 0 ? '+' : ''}
              {formatCurrency(diferenciaTotal)}
            </p>
            {diferenciaSignificativa && (
              <p className="text-sm text-yellow-800 mt-2 flex items-center gap-1">
                <AlertCircle size={14} />
                Diferencia significativa - Se requiere justificación
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notas/Justificación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notas {diferenciaSignificativa && <span className="text-red-600">*</span>}
        </label>
        <textarea
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          rows={4}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            diferenciaSignificativa ? 'border-yellow-500' : 'border-gray-300'
          }`}
          placeholder={
            diferenciaSignificativa
              ? 'Explica la razón de la diferencia...'
              : 'Observaciones del día (opcional)'
          }
          required={diferenciaSignificativa}
        />
        {diferenciaSignificativa && !notas.trim() && (
          <p className="text-sm text-red-600 mt-1">
            Debes justificar diferencias mayores a $20,000
          </p>
        )}
      </div>

      {/* Botones */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isLoading || (diferenciaSignificativa && !notas.trim())}
          className="bg-green-600 hover:bg-green-700"
        >
          {isLoading ? 'Registrando...' : 'Confirmar Cierre'}
        </Button>
      </div>
    </form>
  );
};