// src/components/transacciones/ImprimirFactura.tsx

import React, { useRef } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Printer, X } from 'lucide-react';
import { Transaccion } from '@/types/transaccion.types';
import { Button } from '@components/ui/Button';
import { Modal } from '@components/ui/Modal';

interface ImprimirFacturaProps {
  isOpen: boolean;
  onClose: () => void;
  transaccion: Transaccion;
}

export const ImprimirFactura: React.FC<ImprimirFacturaProps> = ({
  isOpen,
  onClose,
  transaccion,
}) => {
  const facturaRef = useRef<HTMLDivElement>(null);

  const handleImprimir = () => {
    const contenido = facturaRef.current;
    if (!contenido) return;

    const ventana = window.open('', '_blank');
    if (!ventana) return;

    ventana.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Factura ${transaccion.id}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Arial', sans-serif;
              padding: 20px;
              background: white;
            }
            .factura {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .header {
              text-align: center;
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              font-size: 32px;
              margin-bottom: 5px;
              color: #333;
            }
            .header p {
              color: #666;
              font-size: 14px;
            }
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin-bottom: 30px;
            }
            .info-section h3 {
              font-size: 14px;
              color: #666;
              text-transform: uppercase;
              margin-bottom: 10px;
              border-bottom: 1px solid #eee;
              padding-bottom: 5px;
            }
            .info-section p {
              font-size: 14px;
              margin: 5px 0;
            }
            .info-section strong {
              color: #333;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 30px 0;
            }
            th {
              background: #f8f9fa;
              padding: 12px;
              text-align: left;
              font-size: 12px;
              text-transform: uppercase;
              color: #666;
              border-bottom: 2px solid #dee2e6;
            }
            td {
              padding: 12px;
              border-bottom: 1px solid #eee;
              font-size: 14px;
            }
            .text-right {
              text-align: right;
            }
            .total-section {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #333;
            }
            .total-row {
              display: flex;
              justify-content: space-between;
              padding: 10px 0;
              font-size: 16px;
            }
            .total-row.final {
              font-size: 24px;
              font-weight: bold;
              color: #059669;
              padding-top: 15px;
              border-top: 2px solid #eee;
            }
            .footer {
              margin-top: 50px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
            .badge {
              display: inline-block;
              padding: 4px 12px;
              border-radius: 4px;
              font-size: 12px;
              font-weight: 500;
              text-transform: uppercase;
            }
            .badge-success {
              background: #d1fae5;
              color: #065f46;
            }
            .badge-info {
              background: #dbeafe;
              color: #1e40af;
            }
            @media print {
              body {
                padding: 0;
              }
              .factura {
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          ${contenido.innerHTML}
        </body>
      </html>
    `);

    ventana.document.close();
    setTimeout(() => {
      ventana.print();
      ventana.close();
    }, 250);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vista Previa - Factura" size="xl">
      <div className="space-y-4">
        {/* Botones de acción */}
        <div className="flex justify-end gap-3 pb-4 border-b">
          <Button
            variant="secondary"
            onClick={handleImprimir}
            className="flex items-center gap-2"
          >
            <Printer size={18} />
            Imprimir
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X size={18} />
          </Button>
        </div>

        {/* Contenido de la factura */}
        <div ref={facturaRef} className="bg-white p-8">
          <div className="factura">
            {/* Header */}
            <div className="header">
              <h1>LA BARBERÍA</h1>
              <p>Calle 45 #23-10, Bucaramanga</p>
              <p>Tel: (607) 123 4567 | barberia@email.com</p>
            </div>

            {/* Información de la factura */}
            <div className="info-grid">
              <div className="info-section">
                <h3>Información del Cliente</h3>
                <p><strong>Nombre:</strong> {transaccion.cliente?.nombre || 'Cliente General'}</p>
                <p><strong>Teléfono:</strong> {transaccion.cliente?.telefono || 'N/A'}</p>
                {transaccion.cita && (
                  <p><strong>Cita:</strong> {transaccion.cita.radicado}</p>
                )}
              </div>

              <div className="info-section">
                <h3>Información de la Factura</h3>
                <p><strong>Fecha:</strong> {format(new Date(transaccion.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}</p>
                <p><strong>Hora:</strong> {format(new Date(transaccion.fecha), 'HH:mm', { locale: es })}</p>
                <p><strong>Atendido por:</strong> {transaccion.empleado?.nombre || 'N/A'}</p>
                <p>
                  <strong>Método de Pago:</strong>{' '}
                  <span className={`badge ${transaccion.metodoPago === 'EFECTIVO' ? 'badge-success' : 'badge-info'}`}>
                    {transaccion.metodoPago}
                  </span>
                </p>
              </div>
            </div>

            {/* Tabla de servicios */}
            <table>
              <thead>
                <tr>
                  <th>Servicio</th>
                  <th className="text-right">Cantidad</th>
                  <th className="text-right">Precio Unit.</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {transaccion.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong>{item.servicio.nombre}</strong>
                      {item.servicio.descripcion && (
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {item.servicio.descripcion}
                        </div>
                      )}
                    </td>
                    <td className="text-right">{item.cantidad}</td>
                    <td className="text-right">{formatCurrency(item.precioUnitario)}</td>
                    <td className="text-right"><strong>{formatCurrency(item.subtotal)}</strong></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Total */}
            <div className="total-section">
              <div className="total-row">
                <span>Subtotal:</span>
                <span>{formatCurrency(transaccion.total)}</span>
              </div>
              <div className="total-row">
                <span>Descuento:</span>
                <span>{formatCurrency(0)}</span>
              </div>
              <div className="total-row final">
                <span>TOTAL:</span>
                <span>{formatCurrency(transaccion.total)}</span>
              </div>
            </div>

            {/* Notas */}
            {transaccion.notas && (
              <div style={{ marginTop: '30px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}><strong>Notas:</strong></p>
                <p style={{ fontSize: '14px', color: '#333' }}>{transaccion.notas}</p>
              </div>
            )}

            {/* Footer */}
            <div className="footer">
              <p><strong>¡Gracias por tu visita!</strong></p>
              <p>Esperamos verte pronto nuevamente</p>
              <p style={{ marginTop: '10px', fontSize: '11px' }}>
                Esta es una representación impresa de tu factura. Guárdala para cualquier aclaración.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};