// src/components/empleados/ComisionesModal.tsx

import React, { useState, useEffect } from 'react';
import { Modal } from '@components/ui/Modal';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import { 
  DollarSign,
  TrendingUp, 
  Receipt, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Empleado, ComisionPendiente, PagoComision } from '@/types/empleado.types';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

interface ComisionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado;
  onRegistrarPago: (empleadoId: string) => void;
}

type Tab = 'pendientes' | 'historial';

export const ComisionesModal: React.FC<ComisionesModalProps> = ({
  isOpen,
  onClose,
  empleado,
  onRegistrarPago,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>('pendientes');
  const [loading, setLoading] = useState(false);
  const [comisionPendiente, setComisionPendiente] = useState<ComisionPendiente | null>(null);
  const [historial, setHistorial] = useState<PagoComision[]>([]);

  // Fecha del periodo actual
  const hoy = new Date();
  const inicioMes = startOfMonth(hoy);
  const finMes = endOfMonth(hoy);

  useEffect(() => {
    if (isOpen) {
      cargarDatos();
    }
  }, [isOpen, empleado.id]);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      // Importar el servicio
      const { comisionesService } = await import('@services/comisiones.service');
      
      // Cargar comisiones pendientes del mes actual
      const pendientes = await comisionesService.calcularPendientes(
        empleado.id,
        inicioMes,
        finMes
      );
      setComisionPendiente(pendientes);

      // Cargar historial de pagos
      const historialData = await comisionesService.obtenerHistorial(empleado.id);
      setHistorial(historialData);
    } catch (error) {
      console.error('Error cargando comisiones:', error);
      // En caso de error, mostrar datos vacíos
      setComisionPendiente({
        empleado: {
          id: empleado.id,
          nombre: empleado.nombre,
          porcentajeComision: empleado.porcentajeComision,
        },
        periodo: {
          inicio: inicioMes,
          fin: finMes,
        },
        totalVentas: 0,
        montoComision: 0,
        cantidadTransacciones: 0,
        transacciones: [],
      });
      setHistorial([]);
    } finally {
      setLoading(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title={`Comisiones - ${empleado.nombre}`} size="xl">
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Porcentaje de comisión</p>
              <p className="text-3xl font-bold text-blue-600">{empleado.porcentajeComision}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Periodo actual</p>
              <p className="text-sm font-semibold text-gray-900">
                {format(inicioMes, 'dd MMM', { locale: es })} - {format(finMes, 'dd MMM yyyy', { locale: es })}
              </p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-4">
            <button
              onClick={() => setActiveTab('pendientes')}
              className={`
                py-2 px-4 font-medium text-sm border-b-2 transition-colors
                ${activeTab === 'pendientes'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Clock size={18} />
                Comisiones Pendientes
              </div>
            </button>
            <button
              onClick={() => setActiveTab('historial')}
              className={`
                py-2 px-4 font-medium text-sm border-b-2 transition-colors
                ${activeTab === 'historial'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              <div className="flex items-center gap-2">
                <Receipt size={18} />
                Historial de Pagos
              </div>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-600">Cargando información...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Tab: Comisiones Pendientes */}
              {activeTab === 'pendientes' && comisionPendiente && (
                <div className="space-y-6">
                  {/* Resumen */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card className="!p-0">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <TrendingUp className="text-green-600" size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Total Ventas</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(comisionPendiente.totalVentas)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="!p-0">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <DollarSign className="text-blue-600" size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Comisión</p>
                            <p className="text-xl font-bold text-blue-600">
                              {formatCurrency(comisionPendiente.montoComision)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card className="!p-0">
                      <div className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Receipt className="text-purple-600" size={24} />
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Transacciones</p>
                            <p className="text-xl font-bold text-gray-900">
                              {comisionPendiente.cantidadTransacciones}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Cálculo detallado */}
                  <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Cálculo de Comisión</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Total de ventas realizadas</span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(comisionPendiente.totalVentas)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b">
                        <span className="text-gray-600">Porcentaje de comisión</span>
                        <span className="font-semibold text-gray-900">
                          {comisionPendiente.empleado.porcentajeComision}%
                        </span>
                      </div>
                      <div className="flex justify-between items-center py-3 bg-green-50 px-4 rounded-lg">
                        <span className="text-lg font-semibold text-gray-900">Total a pagar</span>
                        <span className="text-2xl font-bold text-green-600">
                          {formatCurrency(comisionPendiente.montoComision)}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Botón de acción */}
                  {comisionPendiente.totalVentas > 0 ? (
                    <div className="flex justify-end">
                      <Button
                        onClick={() => onRegistrarPago(empleado.id)}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle size={20} />
                        Registrar Pago de Comisión
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600">
                        No hay ventas registradas en este periodo
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Tab: Historial */}
              {activeTab === 'historial' && (
                <div>
                  {historial.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-600">No hay pagos de comisión registrados</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {historial.map((pago) => (
                        <Card key={pago.id} className="!p-0">
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <CheckCircle className="text-blue-600" size={24} />
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {format(new Date(pago.fechaPago), 'dd MMMM yyyy', { locale: es })}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    Periodo: {pago.periodo} • {pago.cantidadTransacciones} transacciones
                                  </p>
                                  <div className="flex gap-2 mt-1">
                                    <Badge variant={pago.metodoPago === 'EFECTIVO' ? 'success' : 'info'}>
                                      {pago.metodoPago}
                                    </Badge>
                                    {pago.referencia && (
                                      <span className="text-xs text-gray-500">
                                        Ref: {pago.referencia}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-2xl font-bold text-green-600">
                                  {formatCurrency(pago.montoPagado)}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {pago.porcentaje}% sobre {formatCurrency(pago.totalVentas)}
                                </p>
                              </div>
                            </div>
                            {pago.notas && (
                              <div className="mt-3 pt-3 border-t">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium">Notas:</span> {pago.notas}
                                </p>
                              </div>
                            )}
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t">
          <Button variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};