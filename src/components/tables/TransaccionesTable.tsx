// src/components/tables/TransaccionesTable.tsx - CORREGIDO

import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2, TrendingUp, TrendingDown, DollarSign, Printer, Edit } from 'lucide-react';
import { Transaccion } from '@/types/transaccion.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface TransaccionesTableProps {
  transacciones: Transaccion[];
  onView: (transaccion: Transaccion) => void;
  onEdit: (transaccion: Transaccion) => void;
  onDelete: (transaccion: Transaccion) => void;
  onRecibirPago: (transaccion: Transaccion) => void;
  onImprimir: (transaccion: Transaccion) => void;
}

export const TransaccionesTable: React.FC<TransaccionesTableProps> = ({
  transacciones,
  onView,
  onEdit,
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
    if (metodoPago === 'TRANSFERENCIA') {
      return <Badge variant="info" className="text-xs">Transferencia</Badge>;
    }
    if (metodoPago === 'MIXTO') {
      return <Badge variant="warning">Mixto</Badge>;
    }
    return <Badge variant="default" className="text-xs">{metodoPago}</Badge>;
  };

  return (
    <div className="w-full">
      <table className="w-full divide-y divide-gray-200 table-fixed">
        <thead className="bg-gray-50">
          <tr>
            <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Fecha
            </th>
            <th className="w-28 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Tipo
            </th>
            <th className="w-48 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Descripción
            </th>
            <th className="w-40 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Cliente/Concepto
            </th>
            <th className="w-24 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Estado
            </th>
            <th className="w-32 px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Método
            </th>
            <th className="w-32 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Monto
            </th>
            <th className="w-44 px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
              <td className="px-3 py-2 text-xs text-gray-900">
                <div className="whitespace-nowrap">
                  {format(new Date(transaccion.fecha), 'dd/MM/yy', { locale: es })}
                </div>
                <div className="text-xs text-gray-500">
                  {format(new Date(transaccion.fecha), 'HH:mm', { locale: es })}
                </div>
              </td>
              <td className="px-3 py-2">
                <div className="flex items-center gap-1">
                  {transaccion.tipo === 'INGRESO' ? (
                    <>
                      <TrendingUp className="text-green-600 flex-shrink-0" size={16} />
                      <Badge variant="success" className="text-xs">Ingreso</Badge>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="text-red-600 flex-shrink-0" size={16} />
                      <Badge variant="danger" className="text-xs">Egreso</Badge>
                    </>
                  )}
                </div>
              </td>
              <td className="px-3 py-2">
                {transaccion.tipo === 'INGRESO' ? (
                  <div className="text-xs">
                    {transaccion.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="truncate">
                        {item.cantidad}x {item.servicio.nombre}
                      </div>
                    ))}
                    {transaccion.items.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{transaccion.items.length - 2} más
                      </div>
                    )}
                    {transaccion.cita && (
                      <div className="text-xs text-gray-500">
                        {transaccion.cita.radicado}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs">
                    <div className="font-medium text-gray-900 truncate">
                      {transaccion.concepto}
                    </div>
                    <div className="text-gray-500 text-xs">{transaccion.categoria}</div>
                  </div>
                )}
              </td>
              <td className="px-3 py-2 text-xs">
                {transaccion.tipo === 'INGRESO' ? (
                  transaccion.cliente ? (
                    <div>
                      <div className="font-medium text-gray-900 truncate">
                        {transaccion.cliente.nombre}
                      </div>
                      <div className="text-gray-500 text-xs truncate">
                        {transaccion.empleado?.nombre}
                      </div>
                    </div>
                  ) : (
                    <span className="text-gray-500 italic text-xs">Sin cliente</span>
                  )
                ) : (
                  <span className="text-gray-500">—</span>
                )}
              </td>
              <td className="px-3 py-2">
                {getEstadoBadge(transaccion)}
              </td>
              <td className="px-3 py-2">
                {transaccion.metodoPago === 'MIXTO' && transaccion.montoEfectivo !== null && transaccion.montoTransferencia !== null ? (
                  <div className="space-y-0.5">
                    {getMetodoBadge(transaccion.metodoPago)}
                    <div className="text-xs text-gray-600">
                      💵 {formatCurrency(transaccion.montoEfectivo)}
                    </div>
                    <div className="text-xs text-gray-600">
                      💳 {formatCurrency(transaccion.montoTransferencia)}
                    </div>
                  </div>
                ) : (
                  getMetodoBadge(transaccion.metodoPago)
                )}
              </td>
              <td className="px-3 py-2 text-right">
                <span
                  className={`text-sm font-bold whitespace-nowrap ${
                    transaccion.tipo === 'INGRESO' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {transaccion.tipo === 'INGRESO' ? '+' : '-'}
                  {formatCurrency(transaccion.total)}
                </span>
              </td>
              <td className="px-3 py-2 text-right">
                <div className="flex justify-end gap-1">
                  {/* Botón Recibir Pago (solo para pendientes) */}
                  {transaccion.estadoPago === 'PENDIENTE' && transaccion.tipo === 'INGRESO' && (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => onRecibirPago(transaccion)}
                      title="Recibir pago"
                      className="bg-green-600 hover:bg-green-700 p-1.5"
                    >
                      <DollarSign size={14} />
                    </Button>
                  )}

                  {/* Botón Imprimir (solo para pagadas) */}
                  {transaccion.estadoPago === 'PAGADO' && (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => onImprimir(transaccion)}
                      title="Imprimir factura"
                      className="p-1.5"
                    >
                      <Printer size={14} />
                    </Button>
                  )}

                  {/* Botón Ver */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(transaccion)}
                    title="Ver detalle"
                    className="p-1.5"
                  >
                    <Eye size={14} />
                  </Button>

                  {/* Botón Editar - SIEMPRE VISIBLE */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(transaccion)}
                    title="Editar transacción"
                    className="p-1.5"
                  >
                    <Edit size={14} className="text-blue-600" />
                  </Button>

                  {/* Botón Eliminar (solo pendientes) */}
                  {transaccion.estadoPago === 'PENDIENTE' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(transaccion)}
                      title="Eliminar"
                      className="p-1.5"
                    >
                      <Trash2 size={14} className="text-red-600" />
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