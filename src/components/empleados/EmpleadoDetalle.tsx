// src/components/empleados/EmpleadoDetalle.tsx

import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User, Phone, Calendar, Copy, Check } from 'lucide-react';
import { Empleado } from '@/types/empleado.types';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { api } from '@services/api';

interface EmpleadoDetalleProps {
  empleado: Empleado;
  onEliminar: () => void;
  onEditar: () => void;
  onCerrar: () => void;
  onActualizar?: () => void; // ✅ Para refrescar datos después de conectar
}

export const EmpleadoDetalle: React.FC<EmpleadoDetalleProps> = ({
  empleado,
  onCerrar,
  onActualizar,
}) => {
  const [conectandoCalendar, setConectandoCalendar] = useState(false);
  const [authUrl, setAuthUrl] = useState('');
  const [linkCopiado, setLinkCopiado] = useState(false);

  // ✅ Generar link de autorización
  const generarLinkCalendar = async () => {
    setConectandoCalendar(true);
    try {
      const response = await api.get(`/calendar/auth/${empleado.id}`);
      setAuthUrl(response.data.authUrl);
    } catch (error) {
      alert('Error al generar link de autorización');
      console.error(error);
    } finally {
      setConectandoCalendar(false);
    }
  };

  // ✅ Copiar link al portapapeles
  const copiarLink = () => {
    navigator.clipboard.writeText(authUrl);
    setLinkCopiado(true);
    setTimeout(() => setLinkCopiado(false), 2000);
  };

  // ✅ Desconectar Google Calendar
  const desconectarCalendar = async () => {
    if (!confirm('¿Desconectar Google Calendar? Las citas futuras no se sincronizarán.')) {
      return;
    }

    try {
      await api.post(`/calendar/disconnect/${empleado.id}`);
      alert('Google Calendar desconectado exitosamente');
      if (onActualizar) onActualizar();
    } catch (error) {
      alert('Error al desconectar Google Calendar');
      console.error(error);
    }
  };

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

      {/* ✅ NUEVO: Google Calendar */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-center gap-3 mb-3">
          <Calendar className="text-blue-600" size={24} />
          <h3 className="font-semibold text-gray-900">Google Calendar</h3>
        </div>

        {empleado.calendarioSincronizado ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <p className="text-sm text-green-700 font-medium">
                ✅ Conectado - Las citas se sincronizan automáticamente
              </p>
            </div>
            <p className="text-xs text-gray-600 mb-4">
              {empleado.nombre} puede ver sus citas en su Google Calendar personal
            </p>
            <Button
              onClick={desconectarCalendar}
              variant="ghost"
              className="text-red-600 hover:text-red-700 hover:bg-red-50 text-sm"
            >
              Desconectar
            </Button>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700 mb-4">
              {empleado.nombre} debe autorizar el acceso a su Google Calendar para que sus citas aparezcan automáticamente en su celular.
            </p>

            {!authUrl ? (
              <Button
                onClick={generarLinkCalendar}
                disabled={conectandoCalendar}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                {conectandoCalendar ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Generando link...
                  </>
                ) : (
                  <>
                    <Calendar size={18} className="mr-2" />
                    Generar Link de Conexión
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-lg border border-blue-300">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    📋 Link generado - Envíalo a {empleado.nombre}:
                  </p>
                  <div className="bg-gray-50 p-2 rounded text-xs text-gray-600 break-all mb-3 max-h-20 overflow-y-auto">
                    {authUrl}
                  </div>
                  
                  <button
                    onClick={copiarLink}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {linkCopiado ? (
                      <>
                        <Check size={18} />
                        ¡Copiado!
                      </>
                    ) : (
                      <>
                        <Copy size={18} />
                        Copiar Link
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs font-semibold text-blue-900 mb-2">
                    📱 Instrucciones para {empleado.nombre}:
                  </p>
                  <ol className="text-xs text-blue-800 space-y-1 ml-4 list-decimal">
                    <li>Abre el link que te enviaron</li>
                    <li>Inicia sesión con tu cuenta de Gmail</li>
                    <li>Dale "Permitir" cuando te pregunte si quieres dar acceso</li>
                    <li>¡Listo! Tus citas aparecerán en tu calendario</li>
                  </ol>
                </div>

                <button
                  onClick={() => setAuthUrl('')}
                  className="text-xs text-gray-500 hover:text-gray-700 underline"
                >
                  Generar nuevo link
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Metadata */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600">Registrado</p>
        <p className="font-semibold text-gray-900">
          {empleado.createdAt ? format(new Date(empleado.createdAt), "EEEE, d 'de' MMMM yyyy - HH:mm", { locale: es }) : '—'}
        </p>
      </div>

      {/* Acciones final */}
      <div className="border-t pt-4 flex justify-end">
        <Button variant="ghost" onClick={onCerrar}>Cerrar</Button>
      </div>
    </div>
  );
};