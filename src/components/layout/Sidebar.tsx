import React from "react";
import { NavLink } from "react-router-dom";
import {
  Users,
  Scissors,
  Calendar,
  DollarSign,
  FileText,
  BarChart3,
  UserCircle2,
  Calculator,
} from "lucide-react";
import { clsx } from "clsx";

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

const navigation: NavItem[] = [
  { name: "Dashboard", path: "/", icon: <BarChart3 size={20} /> },
  { name: "Citas", path: "/citas", icon: <Calendar size={20} /> },
  { name: "Clientes", path: "/clientes", icon: <Users size={20} /> },
  { name: "Servicios", path: "/servicios", icon: <Scissors size={20} /> },
  { name: "Empleados", path: "/empleados", icon: <UserCircle2 size={20} /> },
  { name: "Transacciones", path: "/transacciones", icon: <DollarSign size={20} /> },
  { name: "Caja", path: "/cierre-caja", icon: <Calculator size={20} /> },
  { name: "Reportes", path: "/reportes", icon: <FileText size={20} /> },
];

export const Sidebar: React.FC = () => {
  return (
    <div className="w-64 bg-gray-900 min-h-screen flex flex-col">
      {/* Header con logo centrado */}
     <div className="flex flex-col items-center justify-center px-6 py-6 border-b border-gray-800">
  <div style={{ width: 150, height: 100 }} className="flex items-center justify-center overflow-hidden mb-0">
    <img
      src="/Logo_Blanco_Rojo.png"
      alt="M Barberia"
      style={{ width: 350, height: 350, objectFit: 'contain', display: 'block' }}
    />
  </div>

  <h1 className="text-white font-bold text-lg leading-tight text-center">
    Madison MVP Barbería App
  </h1>

  <p className="text-gray-400 text-xs mt-4">Sistema de Gestión</p>

</div>


      {/* Navegación */}
      <nav className="flex-1 px-4 py-6 space-y-1">
        {navigation.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              clsx(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
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
        <div className="text-gray-400 text-xs text-center">
          <p>Versión 1.0.0</p>
          <p className="mt-1">© 2025 Madison MVP Barbería App</p>
        </div>
      </div>
    </div>
  );
};
