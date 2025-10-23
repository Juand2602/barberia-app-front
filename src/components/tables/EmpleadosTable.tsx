// src/components/tables/EmpleadosTable.tsx

import React from 'react';
import { Eye, Edit2, Trash2, DollarSign } from 'lucide-react';
import { Empleado } from '@/types/empleado.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface EmpleadosTableProps {
  empleados: Empleado[];
  onView: (empleado: Empleado) => void;
  onEdit: (empleado: Empleado) => void;
  onDelete: (empleado: Empleado) => void;
  onVerComisiones: (empleado: Empleado) => void; // ✅ NUEVO
}

export const EmpleadosTable: React.FC<EmpleadosTableProps> = ({
  empleados,
  onView,
  onEdit,
  onDelete,
  onVerComisiones, // ✅ NUEVO
}) => {
  if (empleados.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No hay empleados registrados</p>
        <p className="text-gray-400 text-sm mt-2">
          Agrega tu primer barbero para comenzar
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Teléfono
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Especialidades
            </th>
            {/* ✅ NUEVA COLUMNA */}
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Comisión
            </th>
            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
              Citas
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Estado
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha Ingreso
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {empleados.map((empleado) => (
            <tr key={empleado.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{empleado.nombre}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">{empleado.telefono}</div>
              </td>
              <td className="px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {empleado.especialidades.slice(0, 2).map((esp, idx) => (
                    <Badge key={idx} variant="info" className="text-xs">
                      {esp}
                    </Badge>
                  ))}
                  {empleado.especialidades.length > 2 && (
                    <Badge variant="default" className="text-xs">
                      +{empleado.especialidades.length - 2}
                    </Badge>
                  )}
                </div>
              </td>
              {/* ✅ NUEVA COLUMNA - Porcentaje de Comisión */}
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-50 rounded-full">
                  <DollarSign size={14} className="text-green-600" />
                  <span className="text-sm font-semibold text-green-600">
                    {empleado.porcentajeComision}%
                  </span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <span className="text-sm font-medium text-gray-900">
                  {empleado._count?.citas || 0}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {empleado.activo ? (
                  <Badge variant="success">Activo</Badge>
                ) : (
                  <Badge variant="danger">Inactivo</Badge>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(empleado.fechaIngreso), 'dd/MM/yyyy', { locale: es })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <div className="flex justify-end gap-2">
                  {/* ✅ NUEVO BOTÓN - Ver Comisiones */}
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onVerComisiones(empleado)}
                    title="Ver comisiones"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <DollarSign size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onView(empleado)}
                    title="Ver detalle"
                  >
                    <Eye size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(empleado)}
                    title="Editar"
                  >
                    <Edit2 size={16} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(empleado)}
                    title="Desactivar"
                  >
                    <Trash2 size={16} className="text-red-600" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};