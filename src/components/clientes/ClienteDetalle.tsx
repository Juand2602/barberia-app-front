import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Phone, Mail } from 'lucide-react';
import { Cliente } from '@/types/cliente.types';
import { Badge } from '@components/ui/Badge';
import { Button } from '@components/ui/Button';

interface ClienteDetalleProps {
  cliente: Cliente;
  onEliminar: () => void;
  onCerrar: () => void;
}

export const ClienteDetalle: React.FC<ClienteDetalleProps> = ({
  cliente,
  onEliminar,
  onCerrar,
}) => {
  const fechaRegistro = cliente.fechaRegistro ? new Date(cliente.fechaRegistro) : cliente.createdAt ? new Date(cliente.createdAt) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{cliente.nombre}</h2>
          <div className="flex gap-2 mt-2 items-center">
            <Badge variant={cliente.activo ? 'success' : 'danger'}>
              {cliente.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            {fechaRegistro && (
              <span className="text-sm text-gray-500">Registro: {format(fechaRegistro, 'dd/MM/yyyy', { locale: es })}</span>
            )}
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Phone className="text-blue-600" size={18} />
            <h3 className="font-semibold text-gray-900">Teléfono</h3>
          </div>
          <p className="font-medium text-gray-900">{cliente.telefono || '-'}</p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Mail className="text-purple-600" size={18} />
            <h3 className="font-semibold text-gray-900">Email</h3>
          </div>
          <p className="font-medium text-gray-900">{cliente.email || '-'}</p>
        </div>
      </div>

      {/* Notas */}
      {cliente.notas && (
        <div className="border-t pt-4">
          <h3 className="font-semibold text-gray-900 mb-2">Notas</h3>
          <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{cliente.notas}</p>
        </div>
      )}

      {/* Estadísticas o relaciones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Citas</p>
          <p className="text-2xl font-bold text-gray-900">{cliente._count?.citas ?? 0}</p>
        </div>

      </div>

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <p>
          ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{cliente.id}</code>
        </p>
        {cliente.createdAt && (
          <p className="mt-1">Creado: {format(new Date(cliente.createdAt), "d/MM/yyyy HH:mm", { locale: es })}</p>
        )}
      </div>

      {/* Acciones */}
      <div className="border-t pt-4 flex justify-between">
        <Button variant="danger" onClick={onEliminar}>
          Desactivar Cliente
        </Button>
        <Button variant="ghost" onClick={onCerrar}>
          Cerrar
        </Button>
      </div>
    </div>
  );
};
