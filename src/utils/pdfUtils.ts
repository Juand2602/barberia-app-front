// src/utils/pdfUtils.ts

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// 1. IMPORTA LA IMAGEN USANDO EL MÉTODO ROBUSTO
// La ruta es '../../assets/images/logo.png' desde 'src/utils/'
const logoUrl = new URL('../../assets/logo.png', import.meta.url).href;

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
  }

  /**
   * Método público para precargar la marca de agua.
   */
  async prepare() {
    await this.loadWatermarkImage();
  }

  // Precargar la imagen de la marca de agua (genera una versión con opacidad aplicada)
  private async loadWatermarkImage() {
    try {
      // 2. USA LA VARIABLE logoUrl AQUÍ
      const originalData = await this.loadImage(logoUrl);

      const angleDeg = 0;
      const opacity = 0.07;
      const maxDimMm = Math.min(this.pageWidth, this.pageHeight) * 0.6;
      const mmToPx = (mm: number) => Math.round((mm * 96) / 25.4);
      const canvasSizePx = Math.max(mmToPx(maxDimMm), 600);

      const processedData = await this.createRotatedImageDataUrl(originalData, canvasSizePx, angleDeg, opacity);
      this.watermarkData = processedData;
    } catch (error) {
      console.error('Error precargando la imagen de marca de agua:', error);
      this.watermarkData = null;
    }
  }

  /**
   * Crea una dataURL de una imagen rotada (o no) y con opacidad aplicada usando canvas.
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
          ctx.save();
          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate((angleDeg * Math.PI) / 180);
          ctx.globalAlpha = opacity;
          const scale = Math.min(
            (canvas.width * 0.85) / img.width,
            (canvas.height * 0.85) / img.height
          );
          const drawW = img.width * scale;
          const drawH = img.height * scale;
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
    const watermarkSizeMm = Math.min(this.pageWidth, this.pageHeight) * 0.6;
    const x = (this.pageWidth - watermarkSizeMm) / 2;
    const y = (this.pageHeight - watermarkSizeMm) / 2;
    this.doc.addImage(this.watermarkData, 'PNG', x, y, watermarkSizeMm, watermarkSizeMm);
  }

  // Agregar logo en el header
  async addHeader(title: string, subtitle?: string) {
    this.originalTitle = title;
    this.addWatermarkToPage();

    try {
      // 3. USA LA VARIABLE logoUrl AQUÍ TAMBIÉN
      const logoImg = await this.loadImage(logoUrl);

      const logoWidth = 25;
      const logoHeight = 25;
      const logoX = (this.pageWidth - logoWidth) / 2;

      this.doc.addImage(logoImg, 'PNG', logoX, this.margin, logoWidth, logoHeight);

      this.currentY = this.margin + logoHeight + 10;

      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });

      this.currentY += 8;

      if (subtitle) {
        this.doc.setFontSize(12);
        this.doc.setFont('helvetica', 'normal');
        this.doc.setTextColor(100, 100, 100);
        this.doc.text(subtitle, this.pageWidth / 2, this.currentY, { align: 'center' });
        this.currentY += 8;
      }

      this.doc.setDrawColor(200, 200, 200);
      this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
      this.currentY += 10;

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
      this.doc.setFontSize(20);
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(title, this.pageWidth / 2, this.currentY, { align: 'center' });
      this.currentY += 15;
    }
  }

  // ... el resto de tu código (addTable, addText, etc.) no necesita cambios ...
  addTable(headers: string[], rows: any[][], options?: any) {
    autoTable(this.doc, {
      head: [headers],
      body: rows,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [139, 0, 0], textColor: 255, fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      didDrawPage: () => {
        if (this.watermarkData) {
          this.addWatermarkToPage();
        }
      },
      ...options,
    });
    this.currentY = (this.doc.lastAutoTable?.finalY || this.currentY) + 10;
  }

  addText(text: string, fontSize = 10, isBold = false) {
    this.doc.setFontSize(fontSize);
    this.doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    this.doc.text(text, this.margin, this.currentY);
    this.currentY += fontSize / 2 + 2;
  }

  addSection(title: string) {
    this.currentY += 5;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(139, 0, 0);
    this.doc.text(title, this.margin, this.currentY);
    this.currentY += 8;
    this.doc.setTextColor(0, 0, 0);
  }

  addSummaryBoxes(items: { label: string; value: string; color?: string }[]) {
    const boxWidth = (this.pageWidth - this.margin * 2 - 10 * (items.length - 1)) / items.length;
    const boxHeight = 25;
    let currentX = this.margin;

    items.forEach((item) => {
      this.doc.setFillColor(255, 255, 255);
      this.doc.rect(currentX, this.currentY, boxWidth, boxHeight, 'F');
      this.doc.setDrawColor(139, 0, 0);
      this.doc.setLineWidth(0.5);
      this.doc.rect(currentX, this.currentY, boxWidth, boxHeight, 'S');
      this.doc.setDrawColor(220, 220, 220);
      this.doc.line(currentX, this.currentY + 10, currentX + boxWidth, this.currentY + 10);
      this.doc.setFontSize(8);
      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor(100, 100, 100);
      this.doc.text(item.label, currentX + boxWidth / 2, this.currentY + 6, { align: 'center' });
      this.doc.setFontSize(12);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor(0, 0, 0);
      this.doc.text(item.value, currentX + boxWidth / 2, this.currentY + 18, { align: 'center' });
      currentX += boxWidth + 10;
    });

    this.currentY += boxHeight + 15;
    this.doc.setTextColor(0, 0, 0);
  }

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

  addPage() {
    this.doc.addPage();
    this.currentY = this.margin;
    if (this.watermarkData) {
      this.addWatermarkToPage();
    }
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.originalTitle, this.pageWidth / 2, this.margin, { align: 'center' });
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, this.margin + 5, this.pageWidth - this.margin, this.margin + 5);
    this.currentY = this.margin + 15;
  }

  checkPageBreak(requiredHeight: number) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margin) {
      this.addPage();
      return true;
    }
    return false;
  }

  private addFooter() {
    const footerY = this.pageHeight - 10;
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
    this.doc.setFontSize(8);
    this.doc.setTextColor(150, 150, 150);
    this.doc.text('Madison MVP Barberia - Sistema de Gestión', this.pageWidth / 2, footerY, { align: 'center' });
    this.doc.text(`Página ${this.doc.getCurrentPageInfo().pageNumber}`, this.pageWidth - this.margin, footerY, { align: 'right' });
  }

  async save(filename: string) {
    if (!this.watermarkData) {
      await this.loadWatermarkImage();
    }
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      if (this.watermarkData) {
        this.addWatermarkToPage();
      }
      this.addFooter();
    }
    this.doc.save(filename);
  }

  getDoc() {
    return this.doc;
  }
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};