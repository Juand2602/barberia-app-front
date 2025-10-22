import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Package, DollarSign, Clock, Edit, Trash2 } from 'lucide-react';
import { Servicio } from '@/types/servicio.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { transaccionesService } from '@services/transacciones.service';

interface ServicioDetalleProps {
  servicio: Servicio;
  onEliminar: () => void;
  onEditar: () => void;
  onCerrar: () => void;
}

export const ServicioDetalle: React.FC<ServicioDetalleProps> = ({
  servicio,
  onEliminar,
  onEditar,
  onCerrar,
}) => {
  const [ultimasTransacciones, setUltimasTransacciones] = useState<any[]>([]);
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);

  useEffect(() => {
    // Cargar las últimas transacciones que incluyen este servicio (no crítico)
    const load = async () => {
      try {
        // Intento simple: obtener todas las transacciones y filtrar localmente
        // (si tienes un endpoint específico para transacciones por servicio, reemplaza la llamada por ese)
        const todas = await transaccionesService.getAll();
        const filtradas = (todas || []).filter((t: any) =>
          Array.isArray(t.items) && t.items.some((it: any) => it.servicio?.id === servicio.id)
        );
        setUltimasTransacciones(filtradas.slice(0, 5));
      } catch (err) {
        setUltimasTransacciones([]);
      }
    };
    load();
  }, [servicio.id]);

  // obtener el contador de ventas: preferimos `ventas` si existe, sino fallback a _count.items
  const ventasCount = typeof (servicio as any).ventas === 'number'
    ? (servicio as any).ventas
    : servicio._count?.items ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{servicio.nombre}</h2>
          <div className="flex gap-2 mt-2 items-center">
            <Badge variant={servicio.activo ? 'success' : 'danger'}>
              {servicio.activo ? 'Activo' : 'Inactivo'}
            </Badge>
            <span className="text-sm text-gray-500">Duración: {servicio.duracionMinutos} min</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={onEditar} title="Editar servicio">
            <Edit size={16} />
          </Button>
          <Button size="sm" variant="danger" onClick={onEliminar} title="Eliminar servicio">
            <Trash2 size={16} />
          </Button>
        </div>
      </div>

      {/* Precio y Ventas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Precio</p>
          <p className="text-2xl font-bold text-gray-900">
            <DollarSign className="inline-block mr-1" size={18} />
            {formatCurrency(servicio.precio)}
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Duración</p>
          <p className="text-2xl font-bold text-gray-900">
            <Clock className="inline-block mr-1" size={18} />
            {servicio.duracionMinutos} min
          </p>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Ventas</p>
          <p className="text-2xl font-bold text-blue-600">
            {ventasCount} veces
          </p>
        </div>
      </div>

      {/* Descripción */}
      {servicio.descripcion && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Descripción</h3>
          <p className="text-gray-700">{servicio.descripcion}</p>
        </div>
      )}

      {/* Últimas transacciones */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Package className="text-gray-600" size={20} />
          <h3 className="font-semibold text-gray-900">Últimas ventas con este servicio</h3>
        </div>

        {ultimasTransacciones.length === 0 ? (
          <div className="text-sm text-gray-500">No hay transacciones recientes para este servicio.</div>
        ) : (
          <div className="space-y-2">
            {ultimasTransacciones.map((t) => (
              <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900">{t.cliente?.nombre || 'Cliente anónimo'}</div>
                  <div className="text-xs text-gray-500">{format(new Date(t.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}</div>
                </div>
                <div className="text-sm font-semibold text-gray-900">
                  {formatCurrency(t.total)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="border-t pt-4 text-xs text-gray-500">
        <p>ID: <code className="bg-gray-100 px-1 py-0.5 rounded">{servicio.id}</code></p>
        {servicio.createdAt && <p className="mt-1">Creado: {format(new Date(servicio.createdAt), "d/MM/yyyy HH:mm", { locale: es })}</p>}
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
