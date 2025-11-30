// src/pages/Transacciones/TransaccionesPage.tsx - ACTUALIZADO CON ESTADÍSTICAS DIARIAS

import React, { useEffect, useState } from 'react';
import { Plus, TrendingUp, TrendingDown, Filter, Clock, Calendar, Search } from 'lucide-react';
import { useTransaccionesStore } from '@stores/transaccionesStore';
import { useEmpleadosStore } from '@stores/empleadosStore';
import { transaccionesService } from '@services/transacciones.service';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';
import { Modal } from '@components/ui/Modal';
import { TransaccionesTable } from '@components/tables/TransaccionesTable';
import { IngresoForm } from '@components/forms/IngresoForm';
import { EgresoForm } from '@components/forms/EgresoForm';
import { TransaccionDetalle } from '@components/transacciones/TransaccionDetalle';
import { RecibirPagoModal } from '@components/transacciones/RecibirPagoModal';
import { ImprimirTicket } from '@components/transacciones/ImprimirTicket';
import { Transaccion, CreateTransaccionDTO, TipoTransaccion, MarcarPagadaDTO, TransaccionItemDTO, EstadoPago } from '@/types/transaccion.types';

type ModalType = 'ingreso' | 'egreso' | 'editar' | null;

export const TransaccionesPage: React.FC = () => {
  const { transacciones, loading, estadisticas, fetchTransacciones, fetchEstadisticas } =
    useTransaccionesStore();
  const { empleados, fetchEmpleados } = useEmpleadosStore();

  const [modalType, setModalType] = useState<ModalType>(null);
  const [isModalDetalleOpen, setIsModalDetalleOpen] = useState(false);
  const [isModalPagoOpen, setIsModalPagoOpen] = useState(false);
  const [isModalTicketOpen, setIsModalTicketOpen] = useState(false);
  const [transaccionSeleccionada, setTransaccionSeleccionada] = useState<Transaccion | null>(null);
  const [editingTransaccion, setEditingTransaccion] = useState<Transaccion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState<TipoTransaccion | ''>('');
  const [empleadoFiltro, setEmpleadoFiltro] = useState<string>('');
  const [metodoPagoFiltro, setMetodoPagoFiltro] = useState<string>('');
  const [estadoPagoFiltro, setEstadoPagoFiltro] = useState<EstadoPago | ''>('');
  const [filtroRapido, setFiltroRapido] = useState<'todos' | 'hoy'>('hoy');

  useEffect(() => {
    fetchEmpleados(true);
    loadTransacciones();
    loadEstadisticas(); // ✅ Cambio aquí
  }, []);

  useEffect(() => {
    loadTransacciones();
  }, [tipoFiltro, empleadoFiltro, metodoPagoFiltro, estadoPagoFiltro, filtroRapido]);

  const loadTransacciones = () => {
    const filtros: any = {};
    
    // Filtro rápido "Hoy"
    if (filtroRapido === 'hoy') {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      const mañana = new Date(hoy);
      mañana.setDate(mañana.getDate() + 1);
      
      filtros.fechaInicio = hoy;
      filtros.fechaFin = mañana;
    }
    
    if (tipoFiltro) filtros.tipo = tipoFiltro;
    if (empleadoFiltro) filtros.empleadoId = empleadoFiltro;
    if (metodoPagoFiltro) filtros.metodoPago = metodoPagoFiltro;
    if (estadoPagoFiltro) filtros.estadoPago = estadoPagoFiltro;
    fetchTransacciones(filtros);
  };

  // ✅ NUEVA FUNCIÓN: Cargar estadísticas solo del día actual
  const loadEstadisticas = () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);
    
    fetchEstadisticas(hoy, mañana);
  };

  const handleOpenModal = (type: 'ingreso' | 'egreso') => {
    setEditingTransaccion(null);
    setModalType(type);
  };

  const handleCloseModal = () => {
    setModalType(null);
    setEditingTransaccion(null);
  };

  const handleSubmit = async (data: CreateTransaccionDTO) => {
    setIsSubmitting(true);
    try {
      if (editingTransaccion) {
        await transaccionesService.update(editingTransaccion.id, data);
        alert('Transacción actualizada exitosamente');
      } else {
        await transaccionesService.create(data);
        alert(
          `${data.tipo === 'INGRESO' ? 'Venta' : 'Egreso'} registrado exitosamente`
        );
      }
      handleCloseModal();
      loadTransacciones();
      loadEstadisticas(); // ✅ Cambio aquí
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar transacción');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (transaccion: Transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setIsModalDetalleOpen(true);
  };

  const handleEdit = (transaccion: Transaccion) => {
    setEditingTransaccion(transaccion);
    setModalType(transaccion.tipo === 'INGRESO' ? 'ingreso' : 'egreso');
  };

  const handleRecibirPago = (transaccion: Transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setIsModalPagoOpen(true);
  };

  const handleConfirmarPago = async (
    transaccionId: string,
    pagoData: MarcarPagadaDTO,
    itemsActualizados?: TransaccionItemDTO[],
    empleadoIdActualizado?: string
  ) => {
    try {
      // Si hay items actualizados, primero actualizar la transacción
      if (itemsActualizados || empleadoIdActualizado) {
        const total = itemsActualizados
          ? itemsActualizados.reduce((sum, item) => sum + item.subtotal, 0)
          : undefined;

        await transaccionesService.update(transaccionId, {
          total,
          empleadoId: empleadoIdActualizado,
        });
      }

      // Marcar como pagada
      await transaccionesService.marcarComoPagada(transaccionId, pagoData);
      
      alert('Pago recibido exitosamente. La cita ha sido completada.');
      setIsModalPagoOpen(false);
      setTransaccionSeleccionada(null);
      loadTransacciones();
      loadEstadisticas(); // ✅ Cambio aquí
    } catch (error: any) {
      throw error;
    }
  };

  const handleImprimir = (transaccion: Transaccion) => {
    setTransaccionSeleccionada(transaccion);
    setIsModalTicketOpen(true);
  };

  const handleDelete = async (transaccion: Transaccion) => {
    if (transaccion.estadoPago === 'PAGADO') {
      alert('No se puede eliminar una transacción pagada');
      return;
    }

    if (
      !confirm(
        `¿Estás seguro de eliminar esta transacción por ${transaccion.total.toLocaleString()}?`
      )
    )
      return;

    try {
      await transaccionesService.delete(transaccion.id);
      alert('Transacción eliminada exitosamente');
      loadTransacciones();
      loadEstadisticas(); // ✅ Cambio aquí
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al eliminar transacción');
    }
  };

  const handleEliminarDetalle = async () => {
    if (!transaccionSeleccionada) return;
    setIsModalDetalleOpen(false);
    await handleDelete(transaccionSeleccionada);
    setTransaccionSeleccionada(null);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filtrar transacciones por nombre de cliente
  const transaccionesFiltradas = searchTerm
    ? transacciones.filter((t) =>
        t.cliente?.nombre.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : transacciones;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Transacciones</h1>
        <p className="text-gray-600 mt-1">Registra ventas y gastos de tu barbería</p>
      </div>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Ingresos (Hoy)</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(estadisticas.totalIngresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.cantidadIngresos} transacciones
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="text-green-600" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Egresos (Hoy)</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(estadisticas.totalEgresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {estadisticas.cantidadEgresos} transacciones
                  </p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <TrendingDown className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Balance (Hoy)</p>
                <p
                  className={`text-2xl font-bold ${
                    estadisticas.balance >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {formatCurrency(estadisticas.balance)}
                </p>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-gray-500">
                    💵 {formatCurrency(estadisticas.totalEfectivo)}
                  </span>
                  <span className="text-gray-500">
                    💳 {formatCurrency(estadisticas.totalTransferencias)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pendiente</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {formatCurrency(estadisticas.totalPendiente || 0)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Por cobrar</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="space-y-4">
          {/* Filtro Rápido HOY */}
          <div className="flex gap-3">
            <Button
              variant={filtroRapido === 'hoy' ? 'primary' : 'secondary'}
              onClick={() => setFiltroRapido('hoy')}
              className="flex items-center gap-2"
            >
              <Calendar size={18} />
              Hoy
            </Button>
            <Button
              variant={filtroRapido === 'todos' ? 'primary' : 'secondary'}
              onClick={() => setFiltroRapido('todos')}
              className="flex items-center gap-2"
            >
              <Filter size={18} />
              Todas
            </Button>
          </div>

          {/* Barra de búsqueda + Filtros */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Búsqueda por cliente */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <Input
                  type="text"
                  placeholder="Buscar por nombre de cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex gap-3 items-center flex-wrap">
              <Filter size={18} className="text-gray-600" />

              <select
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value as TipoTransaccion | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los tipos</option>
                <option value="INGRESO">Ingresos</option>
                <option value="EGRESO">Egresos</option>
              </select>

              <select
                value={estadoPagoFiltro}
                onChange={(e) => setEstadoPagoFiltro(e.target.value as EstadoPago | '')}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los estados</option>
                <option value="PENDIENTE">Pendientes</option>
                <option value="PAGADO">Pagadas</option>
              </select>

              <select
                value={empleadoFiltro}
                onChange={(e) => setEmpleadoFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los barberos</option>
                {empleados.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.nombre}
                  </option>
                ))}
              </select>

              <select
                value={metodoPagoFiltro}
                onChange={(e) => setMetodoPagoFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los métodos</option>
                <option value="EFECTIVO">Efectivo</option>
                <option value="TRANSFERENCIA">Transferencia</option>
                <option value="MIXTO">Mixto</option>
                <option value="PENDIENTE">Pendiente</option>
              </select>
            </div>

            {/* Botones de acción */}
            <div className="flex gap-3">
              <Button
                onClick={() => handleOpenModal('ingreso')}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <Plus size={20} />
                Registrar Venta
              </Button>
              <Button
                onClick={() => handleOpenModal('egreso')}
                variant="danger"
                className="flex items-center gap-2"
              >
                <Plus size={20} />
                Registrar Gasto
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando transacciones...</p>
          </div>
        ) : (
          <TransaccionesTable
            transacciones={transaccionesFiltradas}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRecibirPago={handleRecibirPago}
            onImprimir={handleImprimir}
          />
        )}
      </Card>

      {/* Modal Ingreso */}
      <Modal
        isOpen={modalType === 'ingreso'}
        onClose={handleCloseModal}
        title={editingTransaccion ? 'Editar Venta' : 'Registrar Venta'}
        size="xl"
      >
        <IngresoForm
          initialData={editingTransaccion || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Egreso */}
      <Modal
        isOpen={modalType === 'egreso'}
        onClose={handleCloseModal}
        title={editingTransaccion ? 'Editar Gasto' : 'Registrar Gasto'}
        size="lg"
      >
        <EgresoForm
          initialData={editingTransaccion || undefined}
          onSubmit={handleSubmit}
          onCancel={handleCloseModal}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={isModalDetalleOpen}
        onClose={() => {
          setIsModalDetalleOpen(false);
          setTransaccionSeleccionada(null);
        }}
        title="Detalle de Transacción"
        size="lg"
      >
        {transaccionSeleccionada && (
          <TransaccionDetalle
            transaccion={transaccionSeleccionada}
            onEliminar={handleEliminarDetalle}
            onCerrar={() => {
              setIsModalDetalleOpen(false);
              setTransaccionSeleccionada(null);
            }}
          />
        )}
      </Modal>

      {/* Modal Recibir Pago */}
      {transaccionSeleccionada && (
        <RecibirPagoModal
          isOpen={isModalPagoOpen}
          onClose={() => {
            setIsModalPagoOpen(false);
            setTransaccionSeleccionada(null);
          }}
          transaccion={transaccionSeleccionada}
          onConfirm={handleConfirmarPago}
        />
      )}

      {/* Modal Imprimir Ticket */}
      {transaccionSeleccionada && (
        <ImprimirTicket
          isOpen={isModalTicketOpen}
          onClose={() => {
            setIsModalTicketOpen(false);
            setTransaccionSeleccionada(null);
          }}
          transaccion={transaccionSeleccionada}
        />
      )}
    </div>
  );
};