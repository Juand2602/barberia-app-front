// src/components/clientes/ClienteDetalle.tsx - ACTUALIZADO

import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, Mail, Award, Calendar, Clock, User, FileText } from "lucide-react";
import { Cliente } from "@/types/cliente.types";
import { Cita } from "@/types/cita.types";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { SellosCliente } from "./SellosCliente";
import { clientesService } from "@services/clientes.service";

interface ClienteDetalleProps {
  cliente: Cliente;
  onCerrar: () => void;
  onActualizar?: () => void;
}

export const ClienteDetalle: React.FC<ClienteDetalleProps> = ({
  cliente,
  onCerrar,
  onActualizar,
}) => {
  const [tabActiva, setTabActiva] = useState<'info' | 'sellos' | 'citas'>('info');
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loadingCitas, setLoadingCitas] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('TODAS');
  
  const fechaRegistro = cliente.fechaRegistro
    ? new Date(cliente.fechaRegistro)
    : cliente.createdAt
      ? new Date(cliente.createdAt)
      : null;

  // Cargar citas cuando se selecciona la pestaña
  useEffect(() => {
    if (tabActiva === 'citas' && citas.length === 0) {
      cargarCitas();
    }
  }, [tabActiva]);

  const cargarCitas = async () => {
    setLoadingCitas(true);
    try {
      const clienteDetalle = await clientesService.getById(cliente.id);
      setCitas(clienteDetalle.citas || []);
    } catch (error) {
      console.error('Error al cargar citas:', error);
    } finally {
      setLoadingCitas(false);
    }
  };

  const handleActualizarSellos = () => {
    if (onActualizar) {
      onActualizar();
    }
  };

  // Filtrar citas según estado seleccionado
  const citasFiltradas = filtroEstado === 'TODAS' 
    ? citas 
    : citas.filter(cita => cita.estado === filtroEstado);

  // Obtener badge según estado
  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { variant: any; label: string }> = {
      PENDIENTE: { variant: 'warning', label: 'Pendiente' },
      CONFIRMADA: { variant: 'info', label: 'Confirmada' },
      COMPLETADA: { variant: 'success', label: 'Completada' },
      CANCELADA: { variant: 'danger', label: 'Cancelada' },
    };
    return badges[estado] || { variant: 'default', label: estado };
  };

  // Contar citas por estado
  const contarPorEstado = (estado: string) => {
    return citas.filter(cita => cita.estado === estado).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h2>
          <div className="flex gap-2 mt-2 items-center">
            <Badge variant={cliente.activo ? "success" : "danger"}>
              {cliente.activo ? "Activo" : "Inactivo"}
            </Badge>
            {fechaRegistro && (
              <span className="text-sm text-gray-500">
                Registro: {format(fechaRegistro, "dd/MM/yyyy", { locale: es })}
              </span>
            )}
          </div>
        </div>
        
        {/* Badge de sellos */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2">
          <div className="flex items-center gap-2">
            <Award className="text-blue-600" size={20} />
            <div>
              <p className="text-xs text-blue-600 font-medium">Sellos Actuales</p>
              <p className="text-2xl font-bold text-blue-900">{cliente.sellos}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-4">
          <button
            onClick={() => setTabActiva('info')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors ${
              tabActiva === 'info'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Información
          </button>
          <button
            onClick={() => setTabActiva('sellos')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              tabActiva === 'sellos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award size={16} />
            Sistema de Sellos
            <Badge variant="info" className="text-xs">
              {cliente.sellos}
            </Badge>
          </button>
          <button
            onClick={() => setTabActiva('citas')}
            className={`py-2 px-4 border-b-2 font-medium text-sm transition-colors flex items-center gap-2 ${
              tabActiva === 'citas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Calendar size={16} />
            Historial de Citas
            <Badge variant="info" className="text-xs">
              {cliente._count?.citas ?? 0}
            </Badge>
          </button>
        </nav>
      </div>

      {/* Contenido según tab */}
      {tabActiva === 'info' && (
        <>
          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="text-blue-600" size={18} />
                <h3 className="font-semibold text-gray-900">Teléfono</h3>
              </div>
              <p className="font-medium text-gray-900">+{cliente.telefono || "-"}</p>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Mail className="text-purple-600" size={18} />
                <h3 className="font-semibold text-gray-900">Email</h3>
              </div>
              <p className="font-medium text-gray-900">{cliente.email || "-"}</p>
            </div>
          </div>

          {/* Notas */}
          {cliente.notas && (
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {cliente.notas}
              </p>
            </div>
          )}

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Citas</p>
              <p className="text-2xl font-bold text-gray-900">
                {cliente._count?.citas ?? 0}
              </p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Sellos Canjeados</p>
              <p className="text-2xl font-bold text-gray-900">
                {cliente.sellosCanjeados}
              </p>
            </div>
          </div>

          {/* Metadata */}
          <div className="border-t pt-4 text-xs text-gray-500">
            <p>
              ID:{" "}
              <code className="bg-gray-100 px-1 py-0.5 rounded">{cliente.id}</code>
            </p>
            {cliente.createdAt && (
              <p className="mt-1">
                Creado:{" "}
                {format(new Date(cliente.createdAt), "d/MM/yyyy HH:mm", {
                  locale: es,
                })}
              </p>
            )}
          </div>
        </>
      )}

      {tabActiva === 'sellos' && (
        <SellosCliente cliente={cliente} onActualizar={handleActualizarSellos} />
      )}

      {tabActiva === 'citas' && (
        <div className="space-y-4">
          {/* Filtros de estado */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFiltroEstado('TODAS')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'TODAS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas ({citas.length})
            </button>
            <button
              onClick={() => setFiltroEstado('COMPLETADA')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'COMPLETADA'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Completadas ({contarPorEstado('COMPLETADA')})
            </button>
            <button
              onClick={() => setFiltroEstado('PENDIENTE')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'PENDIENTE'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes ({contarPorEstado('PENDIENTE')})
            </button>
            <button
              onClick={() => setFiltroEstado('CANCELADA')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filtroEstado === 'CANCELADA'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Canceladas ({contarPorEstado('CANCELADA')})
            </button>
          </div>

          {/* Lista de citas */}
          {loadingCitas ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Cargando citas...</p>
            </div>
          ) : citasFiltradas.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-500 text-lg">
                {filtroEstado === 'TODAS' 
                  ? 'No hay citas registradas'
                  : `No hay citas ${getEstadoBadge(filtroEstado).label.toLowerCase()}`
                }
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {citasFiltradas.map((cita) => {
                const estadoBadge = getEstadoBadge(cita.estado);
                return (
                  <div
                    key={cita.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant={estadoBadge.variant}>
                          {estadoBadge.label}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Radicado: {cita.radicado}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {format(new Date(cita.createdAt), "dd/MM/yyyy HH:mm", { locale: es })}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="text-blue-600" size={16} />
                        <span className="font-medium">
                          {format(new Date(cita.fechaHora), "dd/MM/yyyy", { locale: es })}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="text-green-600" size={16} />
                        <span className="font-medium">
                          {format(new Date(cita.fechaHora), "HH:mm", { locale: es })}
                        </span>
                        <span className="text-gray-500">({cita.duracionMinutos} min)</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <User className="text-purple-600" size={16} />
                        <span className="font-medium">{cita.empleado.nombre}</span>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="text-orange-600" size={16} />
                        <span className="font-medium">{cita.servicioNombre}</span>
                      </div>
                    </div>

                    {cita.notas && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500">Notas:</p>
                        <p className="text-sm text-gray-700 mt-1">{cita.notas}</p>
                      </div>
                    )}

                    {cita.motivoCancelacion && (
                      <div className="mt-3 pt-3 border-t border-gray-100 bg-red-50 -m-4 p-3 rounded-b-lg">
                        <p className="text-xs text-red-600 font-medium">Motivo de cancelación:</p>
                        <p className="text-sm text-red-800 mt-1">{cita.motivoCancelacion}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Acciones */}
      <div className="border-t pt-4 flex justify-end">
        <Button variant="ghost" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};