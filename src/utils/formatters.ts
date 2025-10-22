/**
 * Formatea un número como una moneda en pesos colombianos (COP).
 * @param value - El número a formatear.
 * @returns El string formateado como moneda.
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
  }).format(value);
};