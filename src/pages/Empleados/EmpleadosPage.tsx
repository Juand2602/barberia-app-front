// src/pages/Empleados/EmpleadosPage.tsx - COMPLETO CON COMISIONES Y TOGGLE ESTADO

import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useEmpleadosStore } from '@stores/empleadosStore';
import { empleadosService } from '@services/empleados.service';
import { comisionesService } from '@services/comisiones.service';
import { Empleado, CreateEmpleadoDTO, ComisionPendiente } from '@/types/empleado.types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { EmpleadosTable } from '@components/tables/EmpleadosTable';
import { EmpleadoForm } from '@components/forms/EmpleadoForm';
import { EmpleadoDetalle } from '@components/empleados/EmpleadoDetalle';
import { ComisionesModal } from '@components/empleados/ComisionesModal';
import { RegistrarPagoComisionModal } from '@components/empleados/RegistrarPagoComisionModal';
import { startOfMonth, endOfMonth, format } from 'date-fns';

export const EmpleadosPage: React.FC = () => {
  const { empleados, loading, fetchEmpleados } = useEmpleadosStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detalle
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  // Comisiones
  const [isComisionesOpen, setIsComisionesOpen] = useState(false);
  const [isPagoComisionOpen, setIsPagoComisionOpen] = useState(false);
  const [empleadoComisiones, setEmpleadoComisiones] = useState<Empleado | null>(null);
  const [comisionPendiente, setComisionPendiente] = useState<ComisionPendiente | null>(null);

  useEffect(() => {
    fetchEmpleados();
  }, []);

  const handleCreate = () => {
    setEditingEmpleado(null);
    setIsModalOpen(true);
  };

  const handleEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setIsModalOpen(true);
  };

  const handleView = (empleado: Empleado) => {
    setEmpleadoSeleccionado(empleado);
    setIsDetalleOpen(true);
  };

  const handleDelete = async (empleado: Empleado) => {
    if (!confirm(`¿Estás seguro de desactivar a ${empleado.nombre}?`)) return;

    try {
      await empleadosService.delete(empleado.id);
      fetchEmpleados();
      alert('Empleado desactivado exitosamente');
      if (empleadoSeleccionado?.id === empleado.id) {
        setIsDetalleOpen(false);
        setEmpleadoSeleccionado(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al desactivar empleado');
    }
  };

  // ✅ NUEVO: Función para activar/desactivar empleado
  const handleToggleEstado = async (empleado: Empleado) => {
    const nuevoEstado = !empleado.activo;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    
    if (!confirm(`¿Estás seguro de ${accion} a ${empleado.nombre}?`)) return;

    try {
      await empleadosService.update(empleado.id, { activo: nuevoEstado });
      await fetchEmpleados();
      alert(`Empleado ${nuevoEstado ? 'activado' : 'desactivado'} exitosamente`);
      
      // Si está viendo el detalle de este empleado, actualizar
      if (empleadoSeleccionado?.id === empleado.id) {
        const empleadosActualizados = await empleadosService.getAll();
        const empleadoActualizado = empleadosActualizados.find((e: Empleado) => e.id === empleado.id);
        if (empleadoActualizado) {
          setEmpleadoSeleccionado(empleadoActualizado);
        }
      }
    } catch (error: any) {
      alert(error.response?.data?.message || `Error al ${accion} empleado`);
    }
  };

  const handleSubmit = async (data: CreateEmpleadoDTO) => {
    setIsSubmitting(true);
    try {
      if (editingEmpleado) {
        await empleadosService.update(editingEmpleado.id, data);
        alert('Empleado actualizado exitosamente');
      } else {
        await empleadosService.create(data);
        alert('Empleado creado exitosamente');
      }
      setIsModalOpen(false);
      setEditingEmpleado(null);
      fetchEmpleados();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al guardar empleado');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerComisiones = (empleado: Empleado) => {
    setEmpleadoComisiones(empleado);
    setIsComisionesOpen(true);
  };

  const handleRegistrarPago = async (empleadoId: string) => {
    if (!empleadoComisiones) return;

    try {
      const hoy = new Date();
      const inicio = startOfMonth(hoy);
      const fin = endOfMonth(hoy);

      const comision = await comisionesService.calcularPendientes(
        empleadoId,
        inicio,
        fin
      );

      setComisionPendiente(comision);
      setIsComisionesOpen(false);
      setIsPagoComisionOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al calcular comisiones');
    }
  };

  const handleConfirmarPago = async (data: {
    metodoPago: 'EFECTIVO' | 'TRANSFERENCIA';
    referencia?: string;
    notas?: string;
    ajuste: number;
  }) => {
    if (!empleadoComisiones || !comisionPendiente) return;

    try {
      const hoy = new Date();
      const inicio = startOfMonth(hoy);
      const fin = endOfMonth(hoy);
      const periodo = format(inicio, 'yyyy-MM');

      await comisionesService.registrarPago(empleadoComisiones.id, {
        empleadoId: empleadoComisiones.id,
        periodo,
        fechaInicio: inicio,
        fechaFin: fin,
        metodoPago: data.metodoPago,
        referencia: data.referencia,
        notas: data.notas,
        ajuste: data.ajuste,
      });

      alert('Pago de comisión registrado exitosamente');
      setIsPagoComisionOpen(false);
      setComisionPendiente(null);
      
      setIsComisionesOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al registrar el pago');
      console.error('Error completo:', error);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los barberos, horarios y comisiones
        </p>
      </div>

      {/* Toolbar */}
      <Card className="mb-6">
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-600">
            Total de empleados: <span className="font-semibold">{empleados.length}</span>
          </div>
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus size={20} />
            Nuevo Empleado
          </Button>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-green-600">
              {empleados.filter((e) => e.activo).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Empleados Activos</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-blue-600">
              {empleados.reduce((sum, e) => sum + (e._count?.citas || 0), 0)}
            </p>
            <p className="text-sm text-gray-600 mt-1">Total de Citas</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-3xl font-bold text-purple-600">
              {empleados.filter((e) => !e.activo).length}
            </p>
            <p className="text-sm text-gray-600 mt-1">Inactivos</p>
          </div>
        </Card>
      </div>

      {/* Table */}
      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-4">Cargando empleados...</p>
          </div>
        ) : (
          <EmpleadosTable
            empleados={empleados}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onVerComisiones={handleVerComisiones}
            onToggleEstado={handleToggleEstado} // ✅ NUEVO
          />
        )}
      </Card>

      {/* Modal Form */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingEmpleado(null);
        }}
        title={editingEmpleado ? "Editar Empleado" : "Nuevo Empleado"}
        size="xl"
      >
        <EmpleadoForm
          initialData={
            editingEmpleado
              ? {
                  nombre: editingEmpleado.nombre,
                  telefono: editingEmpleado.telefono,
                  especialidades: editingEmpleado.especialidades,
                  porcentajeComision: editingEmpleado.porcentajeComision,
                  horarioLunes: editingEmpleado.horarioLunes || undefined,
                  horarioMartes: editingEmpleado.horarioMartes || undefined,
                  horarioMiercoles: editingEmpleado.horarioMiercoles || undefined,
                  horarioJueves: editingEmpleado.horarioJueves || undefined,
                  horarioViernes: editingEmpleado.horarioViernes || undefined,
                  horarioSabado: editingEmpleado.horarioSabado || undefined,
                  horarioDomingo: editingEmpleado.horarioDomingo || undefined,
                }
              : undefined
          }
          onSubmit={handleSubmit}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingEmpleado(null);
          }}
          isLoading={isSubmitting}
        />
      </Modal>

      {/* Modal Detalle */}
      <Modal
        isOpen={isDetalleOpen}
        onClose={() => {
          setIsDetalleOpen(false);
          setEmpleadoSeleccionado(null);
        }}
        title="Detalle del Empleado"
        size="lg"
      >
        {empleadoSeleccionado && (
          <EmpleadoDetalle
            empleado={empleadoSeleccionado}
            onEliminar={() => {
              setIsDetalleOpen(false);
              handleDelete(empleadoSeleccionado);
            }}
            onEditar={() => {
              setIsDetalleOpen(false);
              handleEdit(empleadoSeleccionado);
            }}
            onCerrar={() => {
              setIsDetalleOpen(false);
              setEmpleadoSeleccionado(null);
            }}
            onActualizar={async () => {
              await fetchEmpleados();
              const empleadoActualizado = empleados.find(
                (e) => e.id === empleadoSeleccionado.id
              );
              if (empleadoActualizado) {
                setEmpleadoSeleccionado(empleadoActualizado);
              }
            }}
          />
        )}
      </Modal>

      {/* Modal Comisiones */}
      {empleadoComisiones && (
        <ComisionesModal
          isOpen={isComisionesOpen}
          onClose={() => {
            setIsComisionesOpen(false);
            setEmpleadoComisiones(null);
          }}
          empleado={empleadoComisiones}
          onRegistrarPago={handleRegistrarPago}
        />
      )}

      {/* Modal Registrar Pago */}
      {empleadoComisiones && comisionPendiente && (
        <RegistrarPagoComisionModal
          isOpen={isPagoComisionOpen}
          onClose={() => {
            setIsPagoComisionOpen(false);
            setComisionPendiente(null);
          }}
          empleado={empleadoComisiones}
          comisionPendiente={comisionPendiente}
          onConfirm={handleConfirmarPago}
        />
      )}
    </div>
  );
};

export default EmpleadosPage;