// src/utils/pdfUtils.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Extender el tipo de jsPDF para incluir lastAutoTable si está presente
declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export interface PDFOptions {
  title: string;
  subtitle?: string;
  withWatermark?: boolean;
  orientation?: 'portrait' | 'landscape';
}

export class PDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin = 20;
  private currentY = 20;
  private watermarkData: string | null = null; // dataURL PNG ya procesada (rotada/opacidad)
  private originalTitle: string = '';

  constructor(orientation: 'portrait' | 'landscape' = 'portrait') {
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: 'a4',
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();

    // NOTA: ya no precargamos automáticamente en constructor.
    // Llama a `await pdf.prepare()` antes de generar el contenido si quieres precargar.
  }

  /**
   * Método público para precargar la marca de agua.
   * Útil si quieres garantizar que esté lista antes de empezar a dibujar tablas.
   */
  async prepare() {
    await this.loadWatermarkImage();
  }

  // Precargar la imagen de la marca de agua (genera una versión con opacidad aplicada)
  private async loadWatermarkImage() {
    try {
      const originalData = await this.loadImage('/logo.png');

      // Ángulo y opacidad deseada para el watermark
      // Cambia angleDeg a 45 si quieres girarla 45º; ahora está en 0 para NO girarla.
      const angleDeg = 0;
      const opacity = 0.07; // Ajusta entre 0.05 (muy sutil) y 0.20 (más visible)

      // Tamaño máximo en mm que queremos que ocupe la marca de agua en la página
      const maxDimMm = Math.min(this.pageWidth, this.pageHeight) * 0.6;

      // Convertir mm a px para el canvas, usando 96 DPI
      const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);
      const canvasSizePx = Math.max(mmToPx(maxDimMm), 600); // asegurar buena resolución

      const processedData = await this.createRotatedImageDataUrl(originalData, canvasSizePx, angleDeg, opacity);
      this.watermarkData = processedData;
    } catch (error) {
      console.error('Error precargando la imagen de marca de agua:', error);
      this.watermarkData = null;
    }
  }

  /**
   * Crea una dataURL de una imagen rotada (o no) y con opacidad aplicada usando canvas.
   * Evita usar transformaciones no tipadas en jsPDF.
   */
  private createRotatedImageDataUrl(
    srcDataUrl: string,
    sizePx: number,
    angleDeg: number,
    opacity = 0.07
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = sizePx;
          canvas.height = sizePx;
          const ctx = canvas.getContext('2d');
          if (!ctx) return reject(new Error('No se pudo obtener contexto 2D del canvas'));

          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Trasladar al centro y rotar (si angleDeg = 0 no habrá rotación)
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((angleDeg * Math.PI) / 180);

          // Aplicar opacidad global para que la imagen generada ya tenga el alpha deseado
          ctx.globalAlpha = opacity;

          // Escalar la imagen para que quepa dentro del canvas con un padding (85%)
          const scale = Math.min(
            (canvas.width * 0.85) / img.width,
            (canvas.height * 0.85) / img.height
          );

          const drawW = img.width * scale;
          const drawH = img.height * scale;

          // Dibujar centrado (ya estamos en el centro por translate)
          ctx.drawImage(img, -drawW / 2, -drawH / 2, drawW, drawH);

          ctx.restore();

          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = () => reject(new Error('Error cargando imagen en createRotatedImageDataUrl'));
      img.src = srcDataUrl;
    });
  }

  // Agregar marca de agua a la página actual (inserta la imagen ya procesada)
  private addWatermarkToPage() {
    if (!this.watermarkData) return;

    // Tamaño en mm de la imagen en el PDF (ajusta multiplicador al gusto)
    const watermarkSizeMm = Math.min(this.pageWidth, this.pageHeight) * 0.6;

    // Coordenadas para centrar
    const x = (this.pageWidth - watermarkSizeMm) / 2;
    const y = (this.pageHeight - watermarkSizeMm) / 2;

    // Insertar la imagen centrada (ya viene con opacidad y rotación aplicada desde el canvas)
    this.doc.addImage(this.watermarkData, 'PNG', x, y, watermarkSizeMm, watermarkSizeMm);
  }

  // Agregar logo en el header
  async addHeader(title: string, subtitle?: string) {
    this.originalTitle = title;

    // Intentamos añadir la marca si ya fue precargada
    this.addWatermarkToPage();

    try {
      // Cargar el logo para el encabezado (usamos loadImage que devuelve dataURL)
      const logoImg = await this.loadImage('/logo.png');

      // Agregar logo (centrado arriba)
      const logoWidth = 25;
      const logoHeight = 25;
      const logoX = (this.pageWidth - logoWidth) / 2;

      this.doc.addImage(logoImg, 'PNG', logoX, this.margin, logoWidth, logoHeight);

      this.currentY = this.margin + logoHeight + 10;

      // Título
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });

      this.currentY += 8;

      // Subtítulo
      if (subtitle) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 8;
      }

      // Línea separadora
      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 10;

      // Fecha de generación
      this.doc.setFontSize(9);
      this.doc.setTextColor(150, 150, 150);
      const fecha = new Date().toLocaleString('es-CO', {
        dateStyle: 'long',
        timeStyle: 'short',
      });
      this.doc.text(`Generado: ${fecha}`, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 10;

      this.doc.setTextColor(0, 0, 0);
    } catch (error) {
      console.error('Error cargando logo:', error);
      // Continuar sin logo
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 15;
    }
  }

  // Agregar tabla
  addTable(headers: string[], rows: any[][], options?: any) {
    autoTable(this.doc, {
      head: [headers],
      body: rows,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [139, 0, 0], // Color rojo oscuro del logo
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      didDrawPage: () => {
        // AutoTable dibuja la página; aquí intentamos añadir la marca de agua si ya existe.
        // NOTA: didDrawPage no admite async, por eso garantizamos watermark en save().
        if (this.watermarkData) {
          this.addWatermarkToPage();
        }
      },
      ...options,
    });

    this.currentY = (this.doc.lastAutoTable?.finalY || this.currentY) + 10;
  }

  // Agregar texto
  addText(text: string, fontSize = 10, isBold = false) {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize / 2 + 2;
  }

  // Agregar sección
  addSection(title: string) {
    this.currentY += 5;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 0, 0); // Color rojo del logo
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setTextColor(0, 0, 0);
  }

  // Agregar resumen con cajas - versión mejorada y más profesional
  addSummaryBoxes(items: { label: string; value: string; color?: string }[]) {
    const boxWidth = (this.pageWidth - this.margin * 2 - 10 * (items.length - 1)) / items.length;
    const boxHeight = 25; // Aumentado para mejor apariencia
    let currentX = this.margin;

    items.forEach((item) => {
      // Fondo blanco para todas las cajas
      this.doc.setFillColor(255, 255, 255);
      this.doc.rect(currentX, this.currentY, boxWidth, boxHeight, 'F');

      // Borde rojo para todas las cajas
      this.doc.setDrawColor(139, 0, 0);
      this.doc.setLineWidth(0.5);
      this.doc.rect(currentX, this.currentY, boxWidth, boxHeight, 'S');

      // Línea separadora interna
      this.doc.setDrawColor(220, 220, 220);
      this.doc.line(currentX, this.currentY + 10, currentX + boxWidth, this.currentY + 10);

      // Label
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(item.label, currentX + boxWidth / 2, this.currentY + 6, { align: 'center' });

      // Value
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(item.value, currentX + boxWidth / 2, this.currentY + 18, { align: 'center' });

      currentX += boxWidth + 10;
    });

    this.currentY += boxHeight + 15; // Espacio adicional después de las cajas
    this.doc.setTextColor(0, 0, 0);
  }

  // Cargar imagen (helper)
  private loadImage(src: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => reject(new Error(`Error cargando imagen: ${src}`));
      img.src = src;
    });
  }

  // Agregar nueva página
  addPage() {
    this.doc.addPage();
    this.currentY = this.margin;

    // Añadimos watermark solo si ya está disponible
    if (this.watermarkData) {
      this.addWatermarkToPage();
    }

    // Agregar encabezado simplificado en páginas adicionales
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.originalTitle, this.pageWidth / 2, this.margin, { align: 'center' });

    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.margin + 5, this.pageWidth - this.margin, this.margin + 5);

    this.currentY = this.margin + 15;
  }

  // Verificar si necesitamos nueva página
  checkPageBreak(requiredHeight: number) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addPage();
      return true;
    }
    return false;
  }

  // Agregar pie de página
  private addFooter() {
    const footerY = this.pageHeight - 10;

    // Línea separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);

    // Texto del pie de página
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Barberia - Sistema de Gestión', this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Página ${this.doc.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  /**
   * Guardar PDF.
   * Ahora es async: asegura que la marca de agua esté cargada y la inserta en cada página antes de guardar.
   * Uso recomendado:
   *   await pdf.prepare(); // opcional, para precargar
   *   ... generar contenido (addHeader, addTable, etc.)
   *   await pdf.save('reporte.pdf');
   */
  async save(filename: string) {
    // Si watermark no está precargada, la cargamos ahora
    if (!this.watermarkData) {
      await this.loadWatermarkImage();
    }

    // Insertar marca de agua en todas las páginas y luego pie
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);

      // Insertar marca de agua (si se cargó correctamente)
      if (this.watermarkData) {
        this.addWatermarkToPage();
      }

      // Agregar pie de página
      this.addFooter();
    }

    // Guardar el PDF en el cliente
    this.doc.save(filename);
  }

  // Obtener el documento
  getDoc() {
    return this.doc;
  }
}

// Función helper para formatear moneda
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};
