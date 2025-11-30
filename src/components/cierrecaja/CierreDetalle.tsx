// src/components/cierrecaja/CierreDetalle.tsx - CON TRANSFERENCIAS

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Calendar,
  TrendingUp,
  TrendingDown,
  Calculator,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';
import { CierreCaja } from '@/types/cierrecaja.types';
import { Button } from '@components/ui/Button';

interface CierreDetalleProps {
  cierre: CierreCaja;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const CierreDetalle: React.FC<CierreDetalleProps> = ({
  cierre,
  onEliminar,
  onCerrar,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const diferenciaSignificativa = Math.abs(cierre.diferencia) > 20000;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Cierre de Caja</h2>
          <div className="flex items-center gap-2 mt-2 text-gray-600">
            <Calendar size={16} />
            <span>
              {format(new Date(cierre.fecha), "EEEE, d 'de' MMMM yyyy", { locale: es })}
            </span>
          </div>
        </div>
        {diferenciaSignificativa ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full">
            <AlertCircle size={16} />
            <span className="text-sm font-medium">Con diferencia</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-100 text-green-800 rounded-full">
            <CheckCircle size={16} />
            <span className="text-sm font-medium">Sin diferencias</span>
          </div>
        )}
      </div>

      {/* Resumen - 2 filas */}
      <div className="space-y-4">
        {/* Primera fila - Efectivo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
            <p className="text-xs text-blue-900 mb-1">💵 Efectivo Inicial</p>
            <p className="text-lg font-bold text-blue-600">
              {formatCurrency(cierre.efectivoInicial)}
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
            <p className="text-xs text-green-900 mb-1">💵 Ingresos Efectivo</p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(cierre.ingresos)}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200">
            <p className="text-xs text-red-900 mb-1">💵 Egresos Efectivo</p>
            <p className="text-lg font-bold text-red-600">
              {formatCurrency(cierre.egresos)}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
            <p className="text-xs text-gray-900 mb-1">💵 Efectivo Esperado</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(cierre.efectivoEsperado)}
            </p>
          </div>
        </div>

        {/* Segunda fila - Transferencias */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-purple-50 p-4 rounded-lg border-2 border-purple-200">
            <p className="text-xs text-purple-900 mb-1">💳 Transferencias Inicial</p>
            <p className="text-lg font-bold text-purple-600">
              {formatCurrency(cierre.transferenciasInicial || 0)}
            </p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
            <p className="text-xs text-indigo-900 mb-1">💳 Ingresos Transfer.</p>
            <p className="text-lg font-bold text-indigo-600">
              {formatCurrency(cierre.totalTransferencias)}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border-2 border-orange-200">
            <p className="text-xs text-orange-900 mb-1">💳 Egresos Transfer.</p>
            <p className="text-lg font-bold text-orange-600">
              {formatCurrency(0)} {/* Puedes agregar este campo si lo tienes */}
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-300">
            <p className="text-xs text-gray-900 mb-1">💳 Transfer. Esperadas</p>
            <p className="text-lg font-bold text-gray-900">
              {formatCurrency(cierre.transferenciasEsperadas || 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Cálculos - Efectivo */}
      <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-green-600" size={20} />
          <h3 className="font-semibold text-green-900">💵 Cálculo Efectivo</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-green-200">
            <span className="text-gray-700">Efectivo Inicial</span>
            <span className="font-medium">{formatCurrency(cierre.efectivoInicial)}</span>
          </div>

          <div className="flex justify-between items-center text-green-700 pb-2 border-b border-green-200">
            <span className="flex items-center gap-2">
              <TrendingUp size={16} />
              Ingresos en Efectivo
            </span>
            <span className="font-medium">+{formatCurrency(cierre.ingresos)}</span>
          </div>

          <div className="flex justify-between items-center text-red-600 pb-2 border-b border-green-200">
            <span className="flex items-center gap-2">
              <TrendingDown size={16} />
              Egresos en Efectivo
            </span>
            <span className="font-medium">-{formatCurrency(cierre.egresos)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 pb-2 border-b-2 border-green-300">
            <span className="font-semibold text-gray-900">Efectivo Esperado</span>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(cierre.efectivoEsperado)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-900">Efectivo Contado</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(cierre.efectivoFinal)}
            </span>
          </div>
        </div>
      </div>

      {/* Cálculos - Transferencias */}
      <div className="bg-purple-50 p-6 rounded-lg border-2 border-purple-200">
        <div className="flex items-center gap-2 mb-4">
          <Calculator className="text-purple-600" size={20} />
          <h3 className="font-semibold text-purple-900">💳 Cálculo Transferencias</h3>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-purple-200">
            <span className="text-gray-700">Transferencias Inicial</span>
            <span className="font-medium">{formatCurrency(cierre.transferenciasInicial || 0)}</span>
          </div>

          <div className="flex justify-between items-center text-purple-700 pb-2 border-b border-purple-200">
            <span className="flex items-center gap-2">
              <TrendingUp size={16} />
              Ingresos en Transferencias
            </span>
            <span className="font-medium">+{formatCurrency(cierre.totalTransferencias)}</span>
          </div>

          <div className="flex justify-between items-center text-orange-600 pb-2 border-b border-purple-200">
            <span className="flex items-center gap-2">
              <TrendingDown size={16} />
              Egresos en Transferencias
            </span>
            <span className="font-medium">-{formatCurrency(0)}</span>
          </div>

          <div className="flex justify-between items-center pt-2 pb-2 border-b-2 border-purple-300">
            <span className="font-semibold text-gray-900">Transferencias Esperadas</span>
            <span className="text-xl font-bold text-purple-700">
              {formatCurrency(cierre.transferenciasEsperadas || 0)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-gray-900">Transferencias Contadas</span>
            <span className="text-xl font-bold text-gray-900">
              {formatCurrency(cierre.transferenciasFinal || 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Diferencia Total */}
      <div
        className={`p-6 rounded-lg border-2 ${
          cierre.diferencia === 0
            ? 'bg-green-50 border-green-300'
            : cierre.diferencia > 0
            ? 'bg-green-50 border-green-300'
            : 'bg-red-50 border-red-300'
        }`}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-1">
              {cierre.diferencia === 0
                ? 'Cierre Exacto'
                : cierre.diferencia > 0
                ? 'Sobrante Total'
                : 'Faltante Total'}
            </p>
            <p
              className={`text-4xl font-bold ${
                cierre.diferencia === 0
                  ? 'text-green-600'
                  : cierre.diferencia > 0
                  ? 'text-green-600'
                  : 'text-red-600'
              }`}
            >
              {cierre.diferencia >= 0 ? '+' : ''}
              {formatCurrency(cierre.diferencia)}
            </p>
            <p className="text-xs text-gray-600 mt-2">
              (Efectivo + Transferencias)
            </p>
          </div>
          {cierre.diferencia === 0 ? (
            <CheckCircle className="text-green-600" size={48} />
          ) : (
            <AlertCircle
              className={diferenciaSignificativa ? 'text-yellow-600' : 'text-gray-400'}
              size={48}
            />
          )}
        </div>
      </div>

      {/* Notas */}
      {cierre.notas && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
          <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{cierre.notas}</p>
        </div>
      )}

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <p>
          ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{cierre.id}</code>
        </p>
        <p className="mt-1">
          Registrado: {format(new Date(cierre.createdAt), "d/MM/yyyy HH:mm", { locale: es })}
        </p>
      </div>

      {/* Acciones */}
      <div className="border-t pt-4 flex justify-between">
        <Button variant="danger" onClick={onEliminar}>
          Eliminar Cierre
        </Button>
        <Button variant="ghost" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};