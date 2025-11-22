// src/components/clientes/SellosCliente.tsx

import React, { useState, useEffect } from 'react';
import { Gift, Plus, History, Award, TrendingUp } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Badge } from '@components/ui/Badge';
import { Card } from '@components/ui/Card';
import { Modal } from '@components/ui/Modal';
import { Input } from '@components/ui/Input';
import { sellosService } from '@services/sellos.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Cliente, Premio, HistorialSello, EstadisticasSellos } from '@/types/cliente.types';

interface SellosClienteProps {
  cliente: Cliente;
  onActualizar: () => void;
}

export const SellosCliente: React.FC<SellosClienteProps> = ({
  cliente,
  onActualizar,
}) => {
  const [premios, setPremios] = useState<Premio[]>([]);
  const [historial, setHistorial] = useState<HistorialSello[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasSellos | null>(null);
  const [loading, setLoading] = useState(false);

  // Modales
  const [isAgregarModalOpen, setIsAgregarModalOpen] = useState(false);
  const [isCanjearModalOpen, setIsCanjearModalOpen] = useState(false);
  const [isHistorialModalOpen, setIsHistorialModalOpen] = useState(false);

  // Form state
  const [cantidadAgregar, setCantidadAgregar] = useState(1);
  const [motivoAgregar, setMotivoAgregar] = useState('');
  const [premioSeleccionado, setPremioSeleccionado] = useState<string>('');

  useEffect(() => {
    cargarDatos();
  }, [cliente.id]);

  const cargarDatos = async () => {
    try {
      const [premiosData, historialData, estadisticasData] = await Promise.all([
        sellosService.getPremios(),
        sellosService.getHistorial(cliente.id, 10),
        sellosService.getEstadisticas(cliente.id),
      ]);

      setPremios(premiosData);
      setHistorial(historialData);
      setEstadisticas(estadisticasData);
    } catch (error) {
      console.error('Error al cargar datos de sellos:', error);
    }
  };

  const handleAgregarSellos = async () => {
    if (cantidadAgregar <= 0) {
      alert('La cantidad debe ser mayor a 0');
      return;
    }

    setLoading(true);
    try {
      await sellosService.agregarSellos(
        cliente.id,
        cantidadAgregar,
        motivoAgregar || 'Servicio completado'
      );
      
      alert(`✅ ${cantidadAgregar} sello(s) agregado(s) exitosamente`);
      setIsAgregarModalOpen(false);
      setCantidadAgregar(1);
      setMotivoAgregar('');
      onActualizar();
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al agregar sellos');
    } finally {
      setLoading(false);
    }
  };

  const handleCanjearSellos = async () => {
    if (!premioSeleccionado) {
      alert('Selecciona un premio');
      return;
    }

    setLoading(true);
    try {
      const resultado = await sellosService.canjearSellos(
        cliente.id,
        premioSeleccionado
      );
      
      alert(`🎉 Premio "${resultado.premio.nombre}" canjeado exitosamente`);
      setIsCanjearModalOpen(false);
      setPremioSeleccionado('');
      onActualizar();
      cargarDatos();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error al canjear sellos');
    } finally {
      setLoading(false);
    }
  };

  const premiosDisponibles = premios.filter(
    p => p.sellosRequeridos <= cliente.sellos
  );

  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sellos Actuales */}
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Sellos Actuales</p>
              <p className="text-3xl font-bold text-blue-900">{cliente.sellos}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-full">
              <Award className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Sellos Canjeados */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Canjeados</p>
              <p className="text-3xl font-bold text-green-900">{cliente.sellosCanjeados}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-full">
              <Gift className="text-white" size={24} />
            </div>
          </div>
        </Card>

        {/* Total Acumulados */}
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Total Acumulados</p>
              <p className="text-3xl font-bold text-purple-900">
                {estadisticas?.totalAcumulados || 0}
              </p>
            </div>
            <div className="bg-purple-500 p-3 rounded-full">
              <TrendingUp className="text-white" size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* Próximo premio */}
      {estadisticas?.proximoPremio && (
        <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3">
            <div className="bg-amber-500 p-2 rounded-full">
              <Gift className="text-white" size={20} />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-900">
                Próximo premio: {estadisticas.proximoPremio.nombre}
              </p>
              <p className="text-sm text-amber-700">
                Te faltan {estadisticas.proximoPremio.sellosRestantes} sellos
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-amber-900">
                {cliente.sellos}/{estadisticas.proximoPremio.sellosRequeridos}
              </div>
              <div className="w-32 h-2 bg-amber-200 rounded-full overflow-hidden mt-1">
                <div
                  className="h-full bg-amber-500 transition-all"
                  style={{
                    width: `${(cliente.sellos / estadisticas.proximoPremio.sellosRequeridos) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Acciones */}
      <div className="flex gap-3">
        <Button
          onClick={() => setIsAgregarModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus size={18} />
          Agregar Sellos
        </Button>
        
        <Button
          onClick={() => setIsCanjearModalOpen(true)}
          variant="secondary"
          className="flex items-center gap-2"
          disabled={premiosDisponibles.length === 0}
        >
          <Gift size={18} />
          Canjear Premio ({premiosDisponibles.length})
        </Button>

        <Button
          onClick={() => setIsHistorialModalOpen(true)}
          variant="ghost"
          className="flex items-center gap-2"
        >
          <History size={18} />
          Ver Historial
        </Button>
      </div>

      {/* Modal: Agregar Sellos */}
      <Modal
        isOpen={isAgregarModalOpen}
        onClose={() => setIsAgregarModalOpen(false)}
        title="Agregar Sellos"
      >
        <div className="space-y-4">
          <Input
            type="number"
            label="Cantidad de sellos"
            value={cantidadAgregar}
            onChange={(e) => setCantidadAgregar(parseInt(e.target.value) || 1)}
            min={1}
            placeholder="1"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo (opcional)
            </label>
            <textarea
              value={motivoAgregar}
              onChange={(e) => setMotivoAgregar(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ej: Corte completado, Servicio premium..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsAgregarModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAgregarSellos}
              disabled={loading}
            >
              {loading ? 'Agregando...' : 'Agregar Sellos'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Canjear Premio */}
      <Modal
        isOpen={isCanjearModalOpen}
        onClose={() => setIsCanjearModalOpen(false)}
        title="Canjear Premio"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              <strong>Sellos disponibles:</strong> {cliente.sellos}
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-700">
              Selecciona un premio:
            </label>
            {premios.map((premio) => {
              const disponible = cliente.sellos >= premio.sellosRequeridos;
              return (
                <div
                  key={premio.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    premioSeleccionado === premio.id
                      ? 'border-blue-500 bg-blue-50'
                      : disponible
                        ? 'border-gray-300 hover:border-blue-300'
                        : 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => disponible && setPremioSeleccionado(premio.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900">{premio.nombre}</h4>
                        <Badge
                          variant={disponible ? 'success' : 'default'}
                          className="text-xs"
                        >
                          {premio.sellosRequeridos} sellos
                        </Badge>
                      </div>
                      {premio.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">
                          {premio.descripcion}
                        </p>
                      )}
                    </div>
                    {premioSeleccionado === premio.id && (
                      <div className="ml-3">
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="ghost"
              onClick={() => setIsCanjearModalOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCanjearSellos}
              disabled={loading || !premioSeleccionado}
            >
              {loading ? 'Canjeando...' : 'Canjear Premio'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal: Historial */}
      <Modal
        isOpen={isHistorialModalOpen}
        onClose={() => setIsHistorialModalOpen(false)}
        title="Historial de Sellos"
        size="lg"
      >
        <div className="space-y-3">
          {historial.length === 0 ? (
            <p className="text-center text-gray-500 py-8">
              No hay movimientos registrados
            </p>
          ) : (
            historial.map((item) => (
              <div
                key={item.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant={item.tipo === 'AGREGADO' ? 'success' : 'warning'}
                      >
                        {item.tipo === 'AGREGADO' ? '+' : '-'}{item.cantidad}
                      </Badge>
                      <span className="font-medium text-gray-900">
                        {item.tipo === 'AGREGADO' ? 'Sellos Agregados' : 'Premio Canjeado'}
                      </span>
                    </div>
                    {item.motivo && (
                      <p className="text-sm text-gray-600 mb-2">{item.motivo}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      {format(new Date(item.createdAt), "d 'de' MMMM 'de' yyyy 'a las' HH:mm", {
                        locale: es,
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Saldo</p>
                    <p className="text-xl font-bold text-gray-900">
                      {item.sellosTotales}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </Modal>
    </div>
  );
};