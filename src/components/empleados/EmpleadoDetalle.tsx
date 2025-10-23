import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Phone } from 'lucide-react';
import { Empleado } from '@/types/empleado.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';

interface EmpleadoDetalleProps {
  empleado: Empleado;
  onEliminar: () => void;
  onEditar: () => void;
  onCerrar: () => void;
}

export const EmpleadoDetalle: React.FC<EmpleadoDetalleProps> = ({
  empleado,
  onCerrar,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{empleado.nombre}</h2>
          <div className="flex gap-2 mt-2 items-center">
            <Badge variant={empleado.activo ? 'success' : 'danger'}>
              {empleado.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            <span className="text-sm text-gray-500">{(empleado as any).puesto || '—'}</span>
          </div>
        </div>
      </div>

      {/* Contacto */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-center gap-3 mb-3">
          <User className="text-blue-600" size={20} />
          <h3 className="font-semibold text-gray-900">Contacto</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Phone size={16} className="text-gray-500" />
            {empleado.telefono || '—'}
          </div>
        </div>
      </div>

      {/* Especialidades */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-semibold text-gray-900 mb-2">Especialidades</h3>
        <div className="flex flex-wrap gap-2">
          {(empleado.especialidades || []).map((esp: string, idx: number) => (
            <Badge key={idx} variant="info">{esp}</Badge>
          ))}
        </div>
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Registrado</p>
        <p className="font-semibold text-gray-900">
          {empleado.createdAt ? format(new Date(empleado.createdAt), "EEEE, d 'de' MMMM yyyy - HH:mm", { locale: es }) : '—'}
        </p>
      </div>

      {/* Acciones final */}
      <div className="border-t pt-4 flex justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCerrar}>Cerrar</Button>
        </div>
      </div>
    </div>
  );
};
