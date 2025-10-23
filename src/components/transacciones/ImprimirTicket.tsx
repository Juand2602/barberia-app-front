// src/components/transacciones/ImprimirTicket.tsx

import React, { useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer, X } from 'lucide-react';
import { Transaccion } from '@/types/transaccion.types';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';

interface ImprimirTicketProps {
  isOpen: boolean;
  onClose: () => void;
  transaccion: Transaccion;
}

export const ImprimirTicket: React.FC<ImprimirTicketProps> = ({
  isOpen,
  onClose,
  transaccion,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: es });
  };

  const handleImprimir = () => {
    const contenido = ticketRef.current;
    if (!contenido) return;

    const ventana = window.open('', '_blank');
    if (!ventana) return;

    // --- ESTILOS CENTRALIZADOS Y CORREGIDOS CON CONTENEDOR CENTRADO ---
    const printStyles = `
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          line-height: 1.4;
          width: 576px; /* Ancho exacto para impresora de 80mm (se mantiene) */
          margin: 0;
          padding: 0; /* Quitamos el padding del body principal */
          box-sizing: border-box;
        }
        /* --- NUEVO CONTENEDOR CENTRADO --- */
        .ticket-container {
          width: 80%; /* O un valor fijo como 520px */
          max-width: 440px; /* Evita que sea demasiado ancho en pantallas grandes */
          margin: 0 auto; /* ¡Esta es la magia para centrarlo! */
          padding: 5mm; /* El padding ahora va aquí */
          box-sizing: border-box;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px dashed #000; 
          padding-bottom: 10px; 
          margin-bottom: 10px; 
        }
        .title { 
          font-size: 16px; 
          font-weight: bold; 
        }
        .subtitle { 
          font-size: 10px; 
        }
        .section { 
          margin: 10px 0; 
        }
        .item { 
          display: flex; 
          justify-content: space-between; 
          margin: 2px 0; 
        }
        .total-section { 
          border-top: 1px dashed #000; 
          padding-top: 10px; 
          margin-top: 10px; 
        }
        .footer { 
          text-align: center; 
          border-top: 1px dashed #000; 
          padding-top: 10px; 
          margin-top: 10px; 
          font-size: 10px; 
        }
      </style>
    `;

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ticket de Venta #${transaccion.id}</title>
          ${printStyles}
        </head>
        <body>
          <div class="ticket-container">
            ${contenido.innerHTML}
          </div>
        </body>
      </html>
    `);

    ventana.document.close();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 250);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista Previa - Ticket" size="sm">
      <div className="space-y-4">
        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pb-4 border-b">
          <Button
            variant="primary"
            onClick={handleImprimir}
            className="flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir Ticket
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Contenido del ticket para la vista previa */}
        <div 
          ref={ticketRef} 
          className="bg-white p-4 border-2 border-dashed border-gray-300 mx-auto"
          // --- ESTILOS PARA LA VISTA PREVIA (simulando el contenedor centrado) ---
          style={{ 
            width: '80mm', 
            fontFamily: 'Courier New, monospace', 
            fontSize: '12px',
            transform: 'scale(0.85)', 
            transformOrigin: 'top center'
          }}
        >
          {/* Header */}
          <div className="header">
            <div className="title">LA BARBERÍA</div>
            <div className="subtitle">Calle 45 #23-10, Bucaramanga</div>
            <div className="subtitle">Ticket de Venta</div>
          </div>
          
          {/* Información de la venta */}
          <div className="section">
            <strong>Venta #{transaccion.id.slice(-8).toUpperCase()}</strong><br />
            Fecha: {formatDate(transaccion.fecha)}<br />
            {transaccion.empleado && `Barbero: ${transaccion.empleado.nombre}`}
          </div>
          
          {/* Cliente */}
          {transaccion.cliente && (
            <div className="section">
              <strong>CLIENTE:</strong><br />
              {transaccion.cliente.nombre}<br />
              {transaccion.cliente.telefono && `Tel: ${transaccion.cliente.telefono}`}
            </div>
          )}
          
          {/* Cita */}
          {transaccion.cita && (
            <div className="section">
              <strong>CITA:</strong> {transaccion.cita.radicado}
            </div>
          )}
          
          {/* Productos/Servicios */}
          <div className="section">
            <strong>SERVICIOS:</strong>
            {transaccion.items.map((item, idx) => (
              <div key={idx} style={{ margin: '5px 0' }}>
                <div className="item">
                  <div>
                    {item.servicio.nombre}<br />
                    <span style={{ fontSize: '10px' }}>
                      {item.cantidad} x {formatCurrency(item.precioUnitario)}
                    </span>
                  </div>
                  <div>{formatCurrency(item.subtotal)}</div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Total */}
          <div className="total-section">
            <div className="item">
              <span>Subtotal:</span>
              <span>{formatCurrency(transaccion.total)}</span>
            </div>
            <div className="item">
              <span>Descuento:</span>
              <span>{formatCurrency(0)}</span>
            </div>
            <div className="item" style={{ fontWeight: 'bold', fontSize: '14px' }}>
              <strong>TOTAL:</strong>
              <strong>{formatCurrency(transaccion.total)}</strong>
            </div>
          </div>
          
          {/* Pago */}
          <div className="section">
            <strong>PAGO:</strong>
            <div className="item">
              <span>{transaccion.metodoPago}:</span>
              <span>{formatCurrency(transaccion.total)}</span>
            </div>
            {transaccion.referencia && (
              <div style={{ fontSize: '10px' }}>
                Ref: {transaccion.referencia}
              </div>
            )}
          </div>
          
          {/* Notas */}
          {transaccion.notas && (
            <div className="section">
              <strong>NOTAS:</strong><br />
              <span style={{ fontSize: '10px' }}>{transaccion.notas}</span>
            </div>
          )}
          
          {/* Footer */}
          <div className="footer">
            ¡Gracias por tu visita!<br />
            Esperamos verte pronto
          </div>
        </div>
      </div>
    </Modal>
  );
};