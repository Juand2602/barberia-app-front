import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Users, 
  Scissors, 
  Calendar, 
  DollarSign, 
  FileText, 
  Settings,
  BarChart3,
  UserCircle2,
  Calculator  // ← NUEVO
} from 'lucide-react';
import { clsx } from 'clsx';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: 'Dashboard', path: '/', icon: <BarChart3 size={20} /> },
  { name: 'Citas', path: '/citas', icon: <Calendar size={20} /> },
  { name: 'Clientes', path: '/clientes', icon: <Users size={20} /> },
  { name: 'Servicios', path: '/servicios', icon: <Scissors size={20} /> },
  { name: 'Empleados', path: '/empleados', icon: <UserCircle2 size={20} /> },
  { name: 'Transacciones', path: '/transacciones', icon: <DollarSign size={20} /> },
  { name: 'Cierre de Caja', path: '/cierre-caja', icon: <Calculator size={20} /> }, // ← NUEVO
  { name: 'Reportes', path: '/reportes', icon: <FileText size={20} /> },
  { name: 'Configuración', path: '/configuracion', icon: <Settings size={20} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="px-6 py-8 border-b border-gray-800">
        <div className="flex items-center gap-3">
           {/* ✅ LOGO - Opción 1: Con imagen */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden bg-white">
            <img 
              src="/logo.png" 
              alt="M Barberia" 
              className="w-full h-full object-contain"
              onError={(e) => {
                // Si falla al cargar, mostrar el ícono de respaldo
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const parent = target.parentElement;
                if (parent) {
                  parent.classList.add('bg-red-600');
                  const icon = document.createElement('div');
                  icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M18.44 3.06A10.94 10.94 0 0 0 12 0C5.37 0 0 5.37 0 12s5.37 12 12 12 12-5.37 12-12c0-2.11-.55-4.09-1.51-5.82"/><path d="M8.5 12h7"/></svg>';
                  parent.appendChild(icon.firstChild as Node);
                }
              }}
            />
          </div>
          <div>
            <h1 className="text-white font-bold text-xl">Barbería App</h1>
            <p className="text-gray-400 text-xs">Sistema de Gestión</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              )
            }
          >
            {item.icon}
            <span className="font-medium">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <div className="text-gray-400 text-xs">
          <p>Versión 1.0.0</p>
          <p className="mt-1">© 2025 Barbería App</p>
        </div>
      </div>
    </div>
  );
};