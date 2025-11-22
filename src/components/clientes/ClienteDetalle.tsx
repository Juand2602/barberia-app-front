// src/components/clientes/ClienteDetalle.tsx - ACTUALIZADO

import React, { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Phone, Mail, Award } from "lucide-react";
import { Cliente } from "@/types/cliente.types";
import { Badge } from "@components/ui/Badge";
import { Button } from "@components/ui/Button";
import { SellosCliente } from "./SellosCliente";

interface ClienteDetalleProps {
  cliente: Cliente;
  onEliminar: () => void;
  onCerrar: () => void;
  onActualizar?: () => void;
}

export const ClienteDetalle: React.FC<ClienteDetalleProps> = ({
  cliente,
  onCerrar,
  onActualizar,
}) => {
  const [tabActiva, setTabActiva] = useState<'info' | 'sellos'>('info');
  
  const fechaRegistro = cliente.fechaRegistro
    ? new Date(cliente.fechaRegistro)
    : cliente.createdAt
      ? new Date(cliente.createdAt)
      : null;

  const handleActualizarSellos = () => {
    if (onActualizar) {
      onActualizar();
    }
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
        </nav>
      </div>

      {/* Contenido según tab */}
      {tabActiva === 'info' ? (
        <>
          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Phone className="text-blue-600" size={18} />
                <h3 className="font-semibold text-gray-900">Teléfono</h3>
              </div>
              <p className="font-medium text-gray-900">{cliente.telefono || "-"}</p>
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
      ) : (
        <SellosCliente cliente={cliente} onActualizar={handleActualizarSellos} />
      )}

      {/* Acciones */}
      <div className="border-t pt-4 flex justify-between">
        <div />
        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCerrar}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};