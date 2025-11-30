// src/types/cierrecaja.types.ts - ACTUALIZADO

export interface CierreCaja {
  id: string;
  fecha: string;
  efectivoInicial: number;
  efectivoFinal: number;
  efectivoEsperado: number;
  transferenciasInicial?: number;
  transferenciasFinal?: number;
  transferenciasEsperadas?: number;
  ingresos: number;
  egresos: number;
  diferencia: number;
  totalTransferencias: number;
  notas: string | null;
  createdAt: string;
}

export interface CreateCierreCajaDTO {
  fecha?: string;
  efectivoInicial: number;
  efectivoFinal: number;
  transferenciasInicial?: number;
  transferenciasFinal?: number;
  notas?: string;
}

export interface UpdateCierreCajaDTO {
  efectivoInicial?: number;
  efectivoFinal?: number;
  transferenciasInicial?: number;
  transferenciasFinal?: number;
  notas?: string;
}

export interface DatosCierre {
  fecha: string;
  efectivoInicial: number;
  ingresosEfectivo: number;
  egresosEfectivo: number;
  efectivoEsperado: number;
  transferenciasInicial?: number;
  ingresosTransferencias?: number;
  egresosTransferencias?: number;
  transferenciasEsperadas?: number;
  totalTransferencias: number;
}

export interface PuedeCerrarResponse {
  puede: boolean;
  motivo?: string;
  datos?: DatosCierre;
}

export interface CierreCajaEstadisticas {
  totalCierres: number;
  totalIngresos: number;
  totalEgresos: number;
  totalTransferencias: number;
  diferenciaTotal: number;
  diferenciaPromedio: number;
  cierresConDiferenciasSignificativas: number;
}