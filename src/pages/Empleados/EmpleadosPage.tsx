import React, { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { useEmpleadosStore } from '@stores/empleadosStore';
import { empleadosService } from '@services/empleados.service';
import { Empleado, CreateEmpleadoDTO } from '@/types/empleado.types';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';
import { EmpleadosTable } from '@components/tables/EmpleadosTable';
import { EmpleadoForm } from '@components/forms/EmpleadoForm';
import { EmpleadoDetalle } from '@components/empleados/EmpleadoDetalle';

export const EmpleadosPage: React.FC = () => {
  const { empleados, loading, fetchEmpleados } = useEmpleadosStore();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Detalle
  const [isDetalleOpen, setIsDetalleOpen] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState<Empleado | null>(null);

  useEffect(() => {
    fetchEmpleados();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      // si estaba abierto en detalle, ciérralo
      if (empleadoSeleccionado?.id === empleado.id) {
        setIsDetalleOpen(false);
        setEmpleadoSeleccionado(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al desactivar empleado');
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Empleados</h1>
        <p className="text-gray-600 mt-1">
          Gestiona los barberos y su disponibilidad
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
              {empleados.filter(e => e.activo).length}
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
              {empleados.filter(e => !e.activo).length}
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
        title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
        size="xl"
      >
        <EmpleadoForm
          initialData={editingEmpleado ? {
            nombre: editingEmpleado.nombre,
            telefono: editingEmpleado.telefono,
            especialidades: editingEmpleado.especialidades,
            horarioLunes: editingEmpleado.horarioLunes || undefined,
            horarioMartes: editingEmpleado.horarioMartes || undefined,
            horarioMiercoles: editingEmpleado.horarioMiercoles || undefined,
            horarioJueves: editingEmpleado.horarioJueves || undefined,
            horarioViernes: editingEmpleado.horarioViernes || undefined,
            horarioSabado: editingEmpleado.horarioSabado || undefined,
            horarioDomingo: editingEmpleado.horarioDomingo || undefined,
          } : undefined}
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
              // cerrar modal y eliminar
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
          />
        )}
      </Modal>
    </div>
  );
};

export default EmpleadosPage;
