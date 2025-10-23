// src/components/transacciones/ImprimirTicket.tsx - CON LOGO (AJUSTADO ESPACIADO)

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

    const printStyles = `
      <style>
        body { 
          font-family: 'Courier New', monospace; 
          font-size: 12px; 
          line-height: 1.4;
          width: 576px;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        .ticket-container {
          width: 80%;
          max-width: 440px;
          margin: 0 auto;
          padding: 5mm;
          box-sizing: border-box;
        }

        /* --- Ajustes para acercar logo y título --- */
        .logo-container {
          text-align: center;
          margin-bottom: 0px; /* reducido */
        }
        .logo-container img {
          width: 70px; /* un poco más pequeño para evitar empujar */
          height: auto;
          margin: 0 auto;
          display: block;
        }
        .header { 
          text-align: center; 
          border-bottom: 1px dashed #000; 
          padding-bottom: 2px; /* reducido */
          margin-bottom: 4px;  /* reducido */
        }
        .title { 
          font-size: 16px; 
          font-weight: bold;
          margin-top: 0px; /* pequeño ajuste para pegar con el logo */
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
          <meta charset="UTF-8">
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
          style={{ 
            width: '80mm', 
            fontFamily: 'Courier New, monospace', 
            fontSize: '12px',
            transform: 'scale(0.85)', 
            transformOrigin: 'top center'
          }}
        >
          {/* ✅ LOGO */}
          <div 
            className="logo-container" 
            style={{ textAlign: 'center', marginBottom: '2px' }} /* reducido */
          >
            <img 
              src="/logo.png" 
              alt="M Barberia" 
              style={{ width: '70px', height: 'auto', margin: '0 auto', display: 'block' }} /* tamaño reducido y display block */
              onError={(e) => {
                // Si falla al cargar, ocultar la imagen
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {/* Header (con estilos inline para vista previa en DOM) */}
          <div 
            className="header"
            style={{ 
              textAlign: 'center', 
              borderBottom: '1px dashed #000', 
              paddingBottom: '4px', /* reducido */
              marginBottom: '4px'  /* reducido */
            }}
          >
            <div className="title" style={{ marginTop: '2px' }}>M BARBERIA</div>
            <div className="subtitle">Bucaramanga, Santander</div>
            <div className="subtitle">Tel: 300 123 4567</div>
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
