// src/pages/Dashboard/DashboardPage.tsx - VERSIÓN INTEGRADA

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { 
  Users, 
  Scissors, 
  Calendar, 
  DollarSign,
  TrendingUp,
  Bell,
} from 'lucide-react';
import { dashboardService } from '@services/dashboard.service';
import { formatCurrency } from '@utils/formatters';


// 🌟 NUEVAS INTERFACES para el dashboard mejorado
interface DashboardMetricas {
  clientesTotales: number;
  serviciosActivos: number;
  citasHoy: number;
  ingresosHoy: number;
}

interface CitaResumen {
  id: string;
  radicado: string;
  cliente: string;
  telefono: string;
  empleado: string;
  servicio: string;
  fecha: string;
  hora: string;
  duracion: number;
  estado: string;
  origen: string;
  esNueva: boolean;
}

interface DashboardCitas {
  stats: {
    total: number;
    nuevas: number;
    confirmadas: number;
    completadas: number;
    enCurso: number;
  };
  nuevas: CitaResumen[];
  confirmadas: CitaResumen[];
  completadas: CitaResumen[];
  porBarbero: {
    barbero: string;
    total: number;
    completadas: number;
    pendientes: number;
  }[];
}

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  
  const [metricas, setMetricas] = useState<DashboardMetricas | null>(null);
  const [citasData, setCitasData] = useState<DashboardCitas | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadAllData();
    
    // Auto-refresh cada 30 segundos si está activado
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(loadAllData, 30000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadAllData = async () => {
    setLoading(false); // No mostrar loading en actualizaciones automáticas
    try {
      const [metricasData, citasHoyData] = await Promise.all([
        dashboardService.getMetricas(),
        dashboardService.getCitasHoy()
      ]);
      
      setMetricas(metricasData);
      setCitasData(citasHoyData);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
    }
  };

  const stats = [
    {
      name: 'Citas Hoy',
      value: citasData?.stats.total.toString() || metricas?.citasHoy.toString() || '0',
      icon: <Calendar className="text-blue-600" size={24} />,
      bg: 'bg-blue-50',
    },
    {
      name: 'Clientes Totales',
      value: metricas?.clientesTotales.toString() || '0',
      icon: <Users className="text-green-600" size={24} />,
      bg: 'bg-green-50',
    },
    {
      name: 'Ingresos Hoy',
      value: formatCurrency(metricas?.ingresosHoy || 0),
      icon: <DollarSign className="text-purple-600" size={24} />,
      bg: 'bg-purple-50',
    },
    {
      name: 'Servicios Activos',
      value: metricas?.serviciosActivos.toString() || '0',
      icon: <Scissors className="text-orange-600" size={24} />,
      bg: 'bg-orange-50',
    },
  ];

  const quickActions = [
    { label: 'Nueva Cita', path: '/citas', icon: <Calendar size={20} /> },
    { label: 'Nuevo Cliente', path: '/clientes', icon: <Users size={20} /> },
    { label: 'Registrar Venta', path: '/transacciones', icon: <DollarSign size={20} /> },
    { label: 'Ver Reportes', path: '/reportes', icon: <TrendingUp size={20} /> },
  ];

  const getEstadoColor = (estado: string) => {
    const colors: any = {
      PENDIENTE: 'bg-yellow-100 text-yellow-800',
      CONFIRMADA: 'bg-blue-100 text-blue-800',
      COMPLETADA: 'bg-green-100 text-green-800',
      CANCELADA: 'bg-red-100 text-red-800',
    };
    return colors[estado] || 'bg-blue-100 text-blue-800';
  };

  const getOrigenBadge = (origen: string) => {
    if (origen === 'WHATSAPP') {
      return 'bg-green-100 text-green-700';
    }
    return 'bg-blue-100 text-blue-700';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Bienvenido al sistema de gestión de tu barbería
          </p>
        </div>
        
        {/* Controles */}
        <div className="flex gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {autoRefresh ? '🔄 Auto-refresh ON' : '⏸️ Auto-refresh OFF'}
          </button>
          
          <Button
            onClick={loadAllData}
            variant="primary"
            className="flex items-center gap-2"
          >
            🔄 Actualizar
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="!p-0">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.name}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 ${stat.bg} rounded-lg flex items-center justify-center`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card title="Acciones Rápidas" className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <Button
              key={index}
              variant="secondary"
              className="h-24 flex flex-col items-center justify-center gap-2"
              onClick={() => navigate(action.path)}
            >
              {action.icon}
              <span>{action.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* 🌟 NUEVO: Citas del Día */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Estadísticas de Citas */}
        <Card className="lg:col-span-3">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              📅 Citas de Hoy
              {citasData?.stats?.nuevas && citasData.stats.nuevas > 0 && (
                <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full animate-pulse">
                  {citasData.stats.nuevas} nuevas
                </span>
              )}
            </h2>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">Completadas: {citasData?.stats.completadas || 0}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Pendientes: {citasData?.stats.confirmadas || 0}</span>
              </div>
            </div>
          </div>

          {/* 🆕 Citas Nuevas */}
          {citasData?.nuevas && citasData.nuevas.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="text-red-600" size={20} />
                <h3 className="font-bold text-red-600">Citas Nuevas (Últimos 30 min)</h3>
              </div>
              <div className="space-y-2">
                {citasData.nuevas.map((cita) => (
                  <div
                    key={cita.id}
                    className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg hover:bg-red-100 transition-colors cursor-pointer"
                    onClick={() => navigate('/citas')}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-lg font-bold text-gray-900">{cita.hora}</span>
                          <span className="text-gray-900 font-semibold">{cita.cliente}</span>
                          <span className={`text-xs px-2 py-1 rounded ${getOrigenBadge(cita.origen)}`}>
                            {cita.origen}
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>👨‍🦲 {cita.empleado}</span>
                          <span>✂️ {cita.servicio}</span>
                          <span>⏱️ {cita.duracion} min</span>
                        </div>
                      </div>
                      <div className="text-right text-xs">
                        <div className="text-gray-500">{cita.radicado}</div>
                        <div className="text-gray-400">{cita.telefono}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Citas Confirmadas */}
          {citasData?.confirmadas && citasData.confirmadas.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 mb-3">
                ✅ Citas Confirmadas ({citasData.confirmadas.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barbero</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Origen</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {citasData.confirmadas.map((cita) => (
                      <tr 
                        key={cita.id} 
                        className="hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => navigate('/citas')}
                      >
                        <td className="px-4 py-3 whitespace-nowrap font-semibold">{cita.hora}</td>
                        <td className="px-4 py-3">
                          <div className="font-medium">{cita.cliente}</div>
                          <div className="text-xs text-gray-500">{cita.radicado}</div>
                        </td>
                        <td className="px-4 py-3">{cita.empleado}</td>
                        <td className="px-4 py-3">
                          <div>{cita.servicio}</div>
                          <div className="text-xs text-gray-500">{cita.duracion} min</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${getOrigenBadge(cita.origen)}`}>
                            {cita.origen}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 text-xs rounded ${getEstadoColor(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sin citas */}
          {!loading && (!citasData || (citasData.nuevas.length === 0 && citasData.confirmadas.length === 0)) && (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="mx-auto mb-3" size={48} />
              <p>No hay citas programadas para hoy</p>
              <Button 
                variant="primary" 
                className="mt-4"
                onClick={() => navigate('/citas')}
              >
                Agendar Nueva Cita
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* 🌟 NUEVO: Resumen por Barbero */}
      {citasData?.porBarbero && citasData.porBarbero.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {citasData.porBarbero.map((barbero) => (
            <Card key={barbero.barbero} className="border-t-4 border-blue-500">
              <div className="flex items-center gap-3 mb-4">
                <Users className="text-blue-600" size={24} />
                <h3 className="font-bold text-lg">{barbero.barbero}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-bold">{barbero.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Completadas:</span>
                  <span className="text-green-600 font-bold">{barbero.completadas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pendientes:</span>
                  <span className="text-blue-600 font-bold">{barbero.pendientes}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};