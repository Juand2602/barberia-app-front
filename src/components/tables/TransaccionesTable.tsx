// src/components/tables/TransaccionesTable.tsx - ACTUALIZADO

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2, TrendingUp, TrendingDown, DollarSign, Printer } from 'lucide-react';
import { Transaccion } from '@/types/transaccion.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface TransaccionesTableProps {
  transacciones: Transaccion[];
  onView: (transaccion: Transaccion) => void;
  onDelete: (transaccion: Transaccion) => void;
  onRecibirPago: (transaccion: Transaccion) => void;
  onImprimir: (transaccion: Transaccion) => void;
}

export const TransaccionesTable: React.FC<TransaccionesTableProps> = ({
  transacciones,
  onView,
  onDelete,
  onRecibirPago,
  onImprimir,
}) => {
  if (transacciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No se encontraron transacciones</p>
        <p className="text-gray-400 text-sm mt-2">
          Registra tu primera venta o gasto
        </p>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getEstadoBadge = (transaccion: Transaccion) => {
    if (transaccion.estadoPago === 'PENDIENTE') {
      return <Badge variant="warning">Pendiente</Badge>;
    }
    return <Badge variant="success">Pagado</Badge>;
  };

  const getMetodoBadge = (metodoPago: string) => {
    if (metodoPago === 'PENDIENTE') {
      return <Badge variant="default" className="text-xs">Por definir</Badge>;
    }
    if (metodoPago === 'EFECTIVO') {
      return <Badge variant="success" className="text-xs">Efectivo</Badge>;
    }
    return <Badge variant="info" className="text-xs">Transferencia</Badge>;
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Tipo
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Descripción
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Cliente/Concepto
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Método
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Monto
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transacciones.map((transaccion) => (
            <tr 
              key={transaccion.id} 
              className={`hover:bg-gray-50 transition-colors ${
                transaccion.estadoPago === 'PENDIENTE' ? 'bg-yellow-50/30' : ''
              }`}
            >
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(transaccion.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  {transaccion.tipo === 'INGRESO' ? (
                    <>
                      <TrendingUp className="text-green-600" size={18} />
                      <Badge variant="success">Ingreso</Badge>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="text-red-600" size={18} />
                      <Badge variant="danger">Egreso</Badge>
                    </>
                  )}
                </div>
              </td>
              <td className="px-6 py-4">
                {transaccion.tipo === 'INGRESO' ? (
                  <div className="text-sm">
                    {transaccion.items.map((item, idx) => (
                      <div key={idx}>
                        {item.cantidad}x {item.servicio.nombre}
                      </div>
                    ))}
                    {transaccion.cita && (
                      <div className="text-xs text-gray-500 mt-1">
                        Cita: {transaccion.cita.radicado}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="font-medium text-gray-900">{transaccion.concepto}</div>
                    <div className="text-gray-500 text-xs">{transaccion.categoria}</div>
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {transaccion.tipo === 'INGRESO' ? (
                  transaccion.cliente ? (
                    <div>
                      <div className="font-medium text-gray-900">{transaccion.cliente.nombre}</div>
                      <div className="text-gray-500 text-xs">{transaccion.empleado?.nombre}</div>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic">Sin cliente</span>
                  )
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getEstadoBadge(transaccion)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {getMetodoBadge(transaccion.metodoPago)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <span
                  className={`text-lg font-bold ${
                    transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaccion.tipo === 'INGRESO' ? '+' : '-'}
                  {formatCurrency(transaccion.total)}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {/* Botón Recibir Pago (solo para pendientes) */}
                  {transaccion.estadoPago === 'PENDIENTE' && transaccion.tipo === 'INGRESO' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onRecibirPago(transaccion)}
                      title="Recibir pago"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <DollarSign size={16} />
                    </Button>
                  )}

                  {/* Botón Imprimir (solo para pagadas) */}
                  {transaccion.estadoPago === 'PAGADO' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onImprimir(transaccion)}
                      title="Imprimir factura"
                    >
                      <Printer size={16} />
                    </Button>
                  )}

                  {/* Botón Ver */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(transaccion)}
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </Button>

                  {/* Botón Eliminar (solo pendientes) */}
                  {transaccion.estadoPago === 'PENDIENTE' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(transaccion)}
                      title="Eliminar"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </Button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};