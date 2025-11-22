// src/pages/Reportes/ReportesPage.tsx - COMPLETO CON INVENTARIO

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Calendar,
  Package,
  FileText,
  Download,
} from "lucide-react";
import { startOfMonth, endOfMonth, format } from "date-fns";
import { es } from "date-fns/locale";
import { useReportesStore } from "../../stores/reportesStore";
import FiltrosFecha from "../../components/reportes/FiltrosFecha";
import { Card } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { PDFGenerator } from "../../utils/pdfUtils";

const ReportesPage: React.FC = () => {
  const [fechaInicio, setFechaInicio] = useState(startOfMonth(new Date()));
  const [fechaFin, setFechaFin] = useState(endOfMonth(new Date()));
  const [reporteActivo, setReporteActivo] = useState<string>("dashboard");
  const [isExporting, setIsExporting] = useState(false);

  const {
    dashboard,
    reporteVentas,
    reporteVentasPorEmpleado,
    reporteInventario,
    reporteCitas,
    reporteFinanciero,
    reporteClientes,
    loading,
    error,
    fetchDashboard,
    fetchReporteVentas,
    fetchReporteVentasPorEmpleado,
    fetchReporteInventario,
    fetchReporteCitas,
    fetchReporteFinanciero,
    fetchReporteClientes,
  } = useReportesStore();

  useEffect(() => {
    fetchDashboard(fechaInicio, fechaFin);
  }, []);

  const generarReporte = () => {
    switch (reporteActivo) {
      case "dashboard":
        fetchDashboard(fechaInicio, fechaFin);
        break;
      case "ventas":
        fetchReporteVentas(fechaInicio, fechaFin);
        break;
      case "ventas-empleado":
        fetchReporteVentasPorEmpleado(fechaInicio, fechaFin);
        break;
      case "inventario":
        fetchReporteInventario(fechaInicio, fechaFin);
        break;
      case "citas":
        fetchReporteCitas(fechaInicio, fechaFin);
        break;
      case "financiero":
        fetchReporteFinanciero(fechaInicio, fechaFin);
        break;
      case "clientes":
        fetchReporteClientes(fechaInicio, fechaFin);
        break;
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Función para exportar a PDF
  const exportarPDF = async () => {
    setIsExporting(true);
    try {
      const pdf = new PDFGenerator();
      
      const reporteActual = reportes.find(r => r.id === reporteActivo);
      const fechaTexto = `Del ${format(fechaInicio, "dd/MM/yyyy")} al ${format(fechaFin, "dd/MM/yyyy")}`;
      await pdf.addHeader(reporteActual?.nombre || "Reporte", fechaTexto);
      
      switch (reporteActivo) {
        case "dashboard":
          await generarPDFDashboard(pdf);
          break;
        case "ventas":
          await generarPDFVentas(pdf);
          break;
        case "ventas-empleado":
          await generarPDFVentasEmpleado(pdf);
          break;
        case "inventario":
          await generarPDFInventario(pdf);
          break;
        case "citas":
          await generarPDFCitas(pdf);
          break;
        case "financiero":
          await generarPDFFinanciero(pdf);
          break;
        case "clientes":
          await generarPDFClientes(pdf);
          break;
      }
      
      pdf.save(`${reporteActual?.nombre || "Reporte"}_${format(new Date(), "dd-MM-yyyy_HH-mm")}.pdf`);
    } catch (error) {
      console.error("Error al generar PDF:", error);
    } finally {
      setIsExporting(false);
    }
  };

  // Funciones para generar PDF de cada reporte
  const generarPDFDashboard = async (pdf: PDFGenerator) => {
    if (!dashboard) return;
    
    pdf.addSection("Resumen General");
    pdf.addSummaryBoxes([
      { label: "Total Ventas", value: formatCurrency(dashboard.ventas.total), color: "#10b981" },
      { label: "Total Citas", value: dashboard.citas.total.toString(), color: "#3b82f6" },
      { label: "Clientes Nuevos", value: dashboard.clientes.cantidad.toString(), color: "#8b5cf6" },
      { label: "Empleado Top", value: dashboard.empleadoTop?.nombre || "N/A", color: "#6366f1" }
    ]);
    
    pdf.addSection("Servicios Más Vendidos");
    const headers = ["#", "Servicio", "Cantidad", "Total"];
    const data = dashboard.serviciosMasVendidos.map((servicio, index) => [
      (index + 1).toString(),
      servicio.nombre,
      servicio.cantidad.toString(),
      formatCurrency(servicio.total)
    ]);
    pdf.addTable(headers, data);
  };

  const generarPDFVentas = async (pdf: PDFGenerator) => {
    if (!reporteVentas) return;
    
    pdf.addSection("Resumen de Ventas");
    pdf.addSummaryBoxes([
      { label: "Total Ingresos", value: formatCurrency(reporteVentas.resumen.totalIngresos), color: "#10b981" },
      { label: "Cantidad Ventas", value: reporteVentas.resumen.cantidadVentas.toString(), color: "#3b82f6" },
      { label: "Promedio por Venta", value: formatCurrency(reporteVentas.resumen.promedioVenta), color: "#8b5cf6" }
    ]);
    
    pdf.addSection("Ingresos por Método de Pago");
    const headersMetodo = ["Método", "Transacciones", "Total"];
    const dataMetodo = Object.entries(reporteVentas.resumen.porMetodoPago).map(
      ([metodo, data]) => [
        metodo,
        data.cantidad.toString(),
        formatCurrency(data.total)
      ]
    );
    pdf.addTable(headersMetodo, dataMetodo);
    
    const transaccionesPagadas = reporteVentas.transacciones.filter(
      t => t.estadoPago === 'PAGADO'
    );
    
    pdf.addSection("Detalle de Transacciones Pagadas");
    const headersTrans = ["Fecha", "Cliente", "Empleado", "Servicios", "Método", "Total"];
    const dataTrans = transaccionesPagadas.map(t => [
      format(new Date(t.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
      t.cliente,
      t.empleado,
      t.servicios,
      t.metodoPago,
      formatCurrency(t.total)
    ]);
    pdf.addTable(headersTrans, dataTrans);
  };

  const generarPDFVentasEmpleado = async (pdf: PDFGenerator) => {
    if (!reporteVentasPorEmpleado) return;
    
    pdf.addSection("Desempeño por Empleado");
    const headers = ["#", "Empleado", "Ventas", "Total"];
    const data = reporteVentasPorEmpleado.empleados.map((empleado, index) => [
      (index + 1).toString(),
      empleado.nombre,
      empleado.cantidadVentas.toString(),
      formatCurrency(empleado.totalVentas)
    ]);
    pdf.addTable(headers, data);
    
    pdf.addSection("Servicios por Empleado");
    reporteVentasPorEmpleado.empleados.forEach((empleado) => {
      pdf.addText(`${empleado.nombre}:`, 12, true);
      const headersServ = ["Servicio", "Cantidad"];
      const dataServ = Object.entries(empleado.servicios).map(
        ([servicio, cantidad]) => [servicio, cantidad.toString()]
      );
      pdf.addTable(headersServ, dataServ);
    });
  };

  const generarPDFInventario = async (pdf: PDFGenerator) => {
    if (!reporteInventario) return;
    
    pdf.addSection("Resumen de Inventario");
    pdf.addSummaryBoxes([
      { label: "Total Productos", value: reporteInventario.resumen.totalProductos.toString(), color: "#3b82f6" },
      { label: "Stock Bajo", value: reporteInventario.resumen.productosStockBajo.toString(), color: "#ef4444" },
      { label: "Valor Stock", value: formatCurrency(reporteInventario.resumen.valorTotalStock), color: "#8b5cf6" },
      { label: "Ganancia", value: formatCurrency(reporteInventario.resumen.gananciaTotal), color: "#10b981" }
    ]);
    
    pdf.addSection("Productos Más Vendidos");
    const headers = ["#", "Producto", "Cantidad", "Ventas", "Ganancia"];
    const data = reporteInventario.productosMasVendidos.map((prod, index) => [
      (index + 1).toString(),
      prod.nombre,
      prod.cantidadVendida.toString(),
      formatCurrency(prod.totalVentas),
      formatCurrency(prod.ganancia)
    ]);
    pdf.addTable(headers, data);
    
    if (reporteInventario.ventasPorCategoria.length > 0) {
      pdf.addSection("Ventas por Categoría");
      const headersCtg = ["Categoría", "Cantidad", "Total"];
      const dataCtg = reporteInventario.ventasPorCategoria.map((cat) => [
        cat.categoria,
        cat.cantidad.toString(),
        formatCurrency(cat.total)
      ]);
      pdf.addTable(headersCtg, dataCtg);
    }
  };

  const generarPDFCitas = async (pdf: PDFGenerator) => {
    if (!reporteCitas) return;
    
    pdf.addSection("Resumen de Citas");
    pdf.addSummaryBoxes([
      { label: "Total Citas", value: reporteCitas.resumen.totalCitas.toString(), color: "#3b82f6" },
      { label: "Completadas", value: (reporteCitas.resumen.porEstado.COMPLETADA || 0).toString(), color: "#10b981" },
      { label: "Canceladas", value: (reporteCitas.resumen.porEstado.CANCELADA || 0).toString(), color: "#ef4444" },
      { label: "Pendientes", value: ((reporteCitas.resumen.porEstado.PENDIENTE || 0) + (reporteCitas.resumen.porEstado.CONFIRMADA || 0)).toString(), color: "#f59e0b" }
    ]);
    
    pdf.addSection("Ocupación por Empleado");
    const headers = ["Empleado", "Total Citas", "Completadas", "Canceladas"];
    const data = reporteCitas.ocupacionPorEmpleado.map(empleado => [
      empleado.nombre,
      empleado.totalCitas.toString(),
      empleado.completadas.toString(),
      empleado.canceladas.toString()
    ]);
    pdf.addTable(headers, data);
  };

  const generarPDFFinanciero = async (pdf: PDFGenerator) => {
    if (!reporteFinanciero) return;
    
    pdf.addSection("Resumen Financiero");
    pdf.addSummaryBoxes([
      { label: "Ingresos", value: formatCurrency(reporteFinanciero.resumen.totalIngresos), color: "#10b981" },
      { label: "Egresos", value: formatCurrency(reporteFinanciero.resumen.totalEgresos), color: "#ef4444" },
      { label: "Utilidad", value: formatCurrency(reporteFinanciero.resumen.utilidad), color: reporteFinanciero.resumen.utilidad >= 0 ? "#10b981" : "#ef4444" },
      { label: "Margen", value: `${reporteFinanciero.resumen.margenUtilidad.toFixed(1)}%`, color: reporteFinanciero.resumen.margenUtilidad >= 0 ? "#10b981" : "#ef4444" }
    ]);
    
    pdf.addSection("Ingresos por Método de Pago");
    const headersIngresos = ["Método", "Total"];
    const dataIngresos = Object.entries(reporteFinanciero.ingresosPorMetodo).map(
      ([metodo, total]) => [metodo, formatCurrency(total)]
    );
    pdf.addTable(headersIngresos, dataIngresos);
    
    if (reporteFinanciero.egresosPorMetodo && Object.keys(reporteFinanciero.egresosPorMetodo).length > 0) {
      pdf.addSection("Egresos por Método de Pago");
      const headersEgresosMetodo = ["Método", "Total"];
      const dataEgresosMetodo = Object.entries(reporteFinanciero.egresosPorMetodo).map(
        ([metodo, total]) => [metodo, formatCurrency(total)]
      );
      pdf.addTable(headersEgresosMetodo, dataEgresosMetodo);
    }
    
    pdf.addSection("Egresos por Categoría");
    const headersEgresos = ["Categoría", "Total"];
    const dataEgresos = Object.entries(reporteFinanciero.egresosPorCategoria).map(
      ([categoria, total]) => [categoria, formatCurrency(total)]
    );
    pdf.addTable(headersEgresos, dataEgresos);
    
    if (reporteFinanciero.detalleIngresos && reporteFinanciero.detalleIngresos.length > 0) {
      pdf.addSection("Detalle de Ingresos");
      const headersIngTrans = ["Fecha", "Cliente", "Empleado", "Método", "Total"];
      const dataIngTrans = reporteFinanciero.detalleIngresos.map(t => [
        format(new Date(t.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
        t.cliente || "Sin cliente",
        t.empleado || "Sin empleado",
        t.metodoPago,
        formatCurrency(t.total)
      ]);
      pdf.addTable(headersIngTrans, dataIngTrans);
    }
    
    if (reporteFinanciero.detalleEgresos && reporteFinanciero.detalleEgresos.length > 0) {
      pdf.addSection("Detalle de Egresos");
      const headersEgrTrans = ["Fecha", "Concepto", "Categoría", "Método", "Total"];
      const dataEgrTrans = reporteFinanciero.detalleEgresos.map(t => [
        format(new Date(t.fecha), "dd/MM/yyyy HH:mm", { locale: es }),
        t.concepto || "Sin concepto",
        t.categoria || "Sin categoría",
        t.metodoPago,
        formatCurrency(t.total)
      ]);
      pdf.addTable(headersEgrTrans, dataEgrTrans);
    }
  };

  const generarPDFClientes = async (pdf: PDFGenerator) => {
    if (!reporteClientes) return;
    
    pdf.addSection("Resumen de Clientes");
    pdf.addSummaryBoxes([
      { label: "Clientes Nuevos", value: reporteClientes.resumen.clientesNuevos.toString(), color: "#3b82f6" },
      { label: "Clientes Activos", value: reporteClientes.resumen.clientesActivos.toString(), color: "#10b981" },
      { label: "Ticket Promedio", value: formatCurrency(reporteClientes.resumen.ticketPromedio), color: "#8b5cf6" }
    ]);
    
    pdf.addSection("Top 10 Clientes por Gasto");
    const headersTop = ["#", "Cliente", "Compras", "Total Gastado"];
    const dataTop = reporteClientes.topClientes.map((cliente, index) => [
      (index + 1).toString(),
      cliente.nombre,
      cliente.cantidadCompras.toString(),
      formatCurrency(cliente.totalGastado)
    ]);
    pdf.addTable(headersTop, dataTop);
    
    pdf.addSection("Clientes Más Frecuentes");
    const headersFrec = ["#", "Cliente", "Visitas"];
    const dataFrec = reporteClientes.clientesFrecuentes.map((cliente, index) => [
      (index + 1).toString(),
      cliente.nombre,
      cliente.visitas.toString()
    ]);
    pdf.addTable(headersFrec, dataFrec);
  };

  const reportes = [
    {
      id: "dashboard",
      nombre: "Dashboard General",
      icon: BarChart3,
      color: "blue",
    },
    {
      id: "ventas",
      nombre: "Reporte de Ventas",
      icon: DollarSign,
      color: "green",
    },
    {
      id: "ventas-empleado",
      nombre: "Ventas por Empleado",
      icon: Users,
      color: "purple",
    },
    {
      id: "inventario",
      nombre: "Inventario de Nevera",
      icon: Package,
      color: "cyan",
    },
    { id: "citas", nombre: "Reporte de Citas", icon: Calendar, color: "pink" },
    {
      id: "financiero",
      nombre: "Reporte Financiero",
      icon: TrendingUp,
      color: "indigo",
    },
    {
      id: "clientes",
      nombre: "Reporte de Clientes",
      icon: FileText,
      color: "teal",
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reportes y Análisis
        </h1>
        <p className="text-gray-600">
          Analiza el rendimiento de tu barbería con reportes detallados
        </p>
      </div>

      {/* Selector de tipo de reporte */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {reportes.map((reporte) => {
          const Icon = reporte.icon;
          const isActive = reporteActivo === reporte.id;

          return (
            <button
              key={reporte.id}
              onClick={() => setReporteActivo(reporte.id)}
              className={`p-4 rounded-lg border-2 transition-all ${
                isActive
                  ? `border-${reporte.color}-500 bg-${reporte.color}-50`
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <Icon
                className={`w-6 h-6 mx-auto mb-2 ${
                  isActive ? `text-${reporte.color}-600` : "text-gray-400"
                }`}
              />
              <p
                className={`text-xs font-medium text-center ${
                  isActive ? `text-${reporte.color}-900` : "text-gray-600"
                }`}
              >
                {reporte.nombre}
              </p>
            </button>
          );
        })}
      </div>

      {/* Filtros de fecha */}
      <FiltrosFecha
        fechaInicio={fechaInicio}
        fechaFin={fechaFin}
        onFechaInicioChange={setFechaInicio}
        onFechaFinChange={setFechaFin}
        onAplicar={generarReporte}
      />

      {/* Botón de exportación a PDF */}
      <div className="flex justify-end mb-4">
        <button
          onClick={exportarPDF}
          disabled={isExporting || loading}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <Download className="w-4 h-4" />
          {isExporting ? "Exportando..." : "Exportar a PDF"}
        </button>
      </div>

      {/* Contenido del reporte */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generando reporte...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {!loading && !error && (
        <>
          {/* DASHBOARD GENERAL */}
          {reporteActivo === "dashboard" && dashboard && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <DollarSign className="w-8 h-8 text-green-600" />
                    {dashboard.comparativa.porcentaje !== 0 && (
                      <Badge
                        variant={
                          dashboard.comparativa.porcentaje > 0
                            ? "success"
                            : "danger"
                        }
                      >
                        {dashboard.comparativa.porcentaje > 0 ? "+" : ""}
                        {dashboard.comparativa.porcentaje.toFixed(1)}%
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formatCurrency(dashboard.ventas.total)}
                  </h3>
                  <p className="text-sm text-gray-600">Total en Ventas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.ventas.cantidad} transacciones pagadas
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Calendar className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.citas.total}
                  </h3>
                  <p className="text-sm text-gray-600">Total de Citas</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {dashboard.citas.porEstado.COMPLETADA || 0} completadas
                  </p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <Users className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.clientes.cantidad}
                  </h3>
                  <p className="text-sm text-gray-600">Clientes Nuevos</p>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {dashboard.empleadoTop
                      ? dashboard.empleadoTop.nombre
                      : "N/A"}
                  </h3>
                  <p className="text-sm text-gray-600">Empleado Top</p>
                  {dashboard.empleadoTop && (
                    <p className="text-xs text-gray-500 mt-1">
                      {formatCurrency(dashboard.empleadoTop.total)}
                    </p>
                  )}
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Servicios Más Vendidos
                  </h3>
                  <div className="space-y-3">
                    {dashboard.serviciosMasVendidos.map((servicio, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {servicio.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {servicio.cantidad} ventas
                            </p>
                          </div>
                        </div>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(servicio.total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE DE VENTAS */}
          {reporteActivo === "ventas" && reporteVentas && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Total Ingresos</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteVentas.resumen.totalIngresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Solo transacciones pagadas</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Cantidad de Ventas
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteVentas.resumen.cantidadVentas}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Transacciones pagadas</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Promedio por Venta
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteVentas.resumen.promedioVenta)}
                  </p>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ingresos por Método de Pago
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(reporteVentas.resumen.porMetodoPago).map(
                      ([metodo, data]) => (
                        <div
                          key={metodo}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">
                              {metodo}
                            </p>
                            <p className="text-sm text-gray-500">
                              {data.cantidad} transacciones
                            </p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(data.total)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </Card>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Detalle de Transacciones Pagadas
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Fecha
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Cliente
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Empleado
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Servicios
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                            Método
                          </th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteVentas.transacciones
                          .filter(t => t.estadoPago === 'PAGADO')
                          .map((t) => (
                          <tr key={t.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {format(new Date(t.fecha), "dd/MM/yyyy HH:mm", {
                                locale: es,
                              })}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {t.cliente}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {t.empleado}
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-600">
                              {t.servicios}
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant={
                                  t.metodoPago === "EFECTIVO"
                                    ? "success"
                                    : "info"
                                }
                              >
                                {t.metodoPago}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                              {formatCurrency(t.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* VENTAS POR EMPLEADO */}
          {reporteActivo === "ventas-empleado" && reporteVentasPorEmpleado && (
            <Card>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Desempeño por Empleado (Solo Ventas Pagadas)
                </h3>
                <div className="space-y-4">
                  {reporteVentasPorEmpleado.empleados.map((empleado, index) => (
                    <div
                      key={empleado.empleadoId}
                      className="p-4 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-10 h-10 rounded-full bg-purple-100 text-purple-600 font-bold">
                            {index + 1}
                          </span>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {empleado.nombre}
                            </p>
                            <p className="text-sm text-gray-500">
                              {empleado.cantidadVentas} ventas realizadas
                            </p>
                          </div>
                        </div>
                        <span className="text-xl font-bold text-gray-900">
                          {formatCurrency(empleado.totalVentas)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(empleado.servicios).map(
                          ([servicio, cantidad]) => (
                            <Badge key={servicio} variant="default">
                              {servicio}: {cantidad}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          )}

          {/* INVENTARIO DE NEVERA */}
          {reporteActivo === "inventario" && reporteInventario && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Total Productos</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {reporteInventario.resumen.totalProductos}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Stock Bajo</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {reporteInventario.resumen.productosStockBajo}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Valor Stock</h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(reporteInventario.resumen.valorTotalStock)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Ganancia</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reporteInventario.resumen.gananciaTotal)}
                  </p>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Productos Más Vendidos
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">#</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Categoría</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Cantidad</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total Ventas</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ganancia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteInventario.productosMasVendidos.map((prod, index) => (
                          <tr key={prod.productoId} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-600">{index + 1}</td>
                            <td className="py-3 px-4 text-sm font-medium text-gray-900">{prod.nombre}</td>
                            <td className="py-3 px-4">
                              <Badge variant="default">{prod.categoria}</Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-right text-gray-900">
                              {prod.cantidadVendida}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-right text-green-600">
                              {formatCurrency(prod.totalVentas)}
                            </td>
                            <td className="py-3 px-4 text-sm font-semibold text-right text-blue-600">
                              {formatCurrency(prod.ganancia)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>

              {reporteInventario.ventasPorCategoria.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ventas por Categoría
                    </h3>
                    <div className="space-y-3">
                      {reporteInventario.ventasPorCategoria.map((cat) => (
                        <div
                          key={cat.categoria}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div>
                            <p className="font-medium text-gray-900">{cat.categoria}</p>
                            <p className="text-sm text-gray-500">{cat.cantidad} unidades</p>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(cat.total)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              )}

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Últimos Movimientos
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Fecha</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                          <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Producto</th>
                          <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Cantidad</th>
                          <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reporteInventario.movimientos.slice(0, 20).map((mov, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4 text-sm text-gray-900">
                              {format(new Date(mov.fecha), "dd/MM/yyyy HH:mm", { locale: es })}
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant={mov.tipo === 'COMPRA' ? 'info' : 'success'}>
                                {mov.tipo}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-sm text-gray-900">{mov.producto}</td>
                            <td className="py-3 px-4 text-center">
                              <span className={`font-semibold ${mov.tipo === 'COMPRA' ? 'text-blue-600' : 'text-red-600'}`}>
                                {mov.tipo === 'COMPRA' ? '+' : '-'}{mov.cantidad}
                              </span>
                            </td>
                            <td className={`py-3 px-4 text-right font-semibold ${mov.tipo === 'COMPRA' ? 'text-blue-600' : 'text-green-600'}`}>
                              {formatCurrency(mov.total)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE DE CITAS */}
          {reporteActivo === "citas" && reporteCitas && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Total Citas</h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteCitas.resumen.totalCitas}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Completadas</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {reporteCitas.resumen.porEstado.COMPLETADA || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reporteCitas.resumen.tasaCompletadas.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Canceladas</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {reporteCitas.resumen.porEstado.CANCELADA || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {reporteCitas.resumen.tasaCancelacion.toFixed(1)}%
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Pendientes</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {(reporteCitas.resumen.porEstado.PENDIENTE || 0) +
                      (reporteCitas.resumen.porEstado.CONFIRMADA || 0)}
                  </p>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Ocupación por Empleado
                  </h3>
                  <div className="space-y-3">
                    {reporteCitas.ocupacionPorEmpleado.map((empleado) => (
                      <div
                        key={empleado.empleadoId}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <p className="font-semibold text-gray-900">
                            {empleado.nombre}
                          </p>
                          <span className="text-lg font-bold text-gray-900">
                            {empleado.totalCitas} citas
                          </span>
                        </div>
                        <div className="flex gap-4 text-sm">
                          <span className="text-green-600">
                            ✓ {empleado.completadas} completadas
                          </span>
                          <span className="text-red-600">
                            ✗ {empleado.canceladas} canceladas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* REPORTE FINANCIERO */}
          {reporteActivo === "financiero" && reporteFinanciero && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Ingresos</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(reporteFinanciero.resumen.totalIngresos)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Solo pagadas</p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Egresos</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(reporteFinanciero.resumen.totalEgresos)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Utilidad</h3>
                  <p
                    className={`text-2xl font-bold ${
                      reporteFinanciero.resumen.utilidad >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {formatCurrency(reporteFinanciero.resumen.utilidad)}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">Margen</h3>
                  <p
                    className={`text-2xl font-bold ${
                      reporteFinanciero.resumen.margenUtilidad >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {reporteFinanciero.resumen.margenUtilidad.toFixed(1)}%
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Ingresos por Método de Pago
                    </h3>
                    <div className="space-y-3">
                      {Object.entries(reporteFinanciero.ingresosPorMetodo).map(
                        ([metodo, total]) => (
                          <div
                            key={metodo}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <span className="font-medium text-gray-900">
                              {metodo}
                            </span>
                            <span className="font-semibold text-gray-900">
                              {formatCurrency(total)}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Egresos por Método de Pago
                    </h3>
                    <div className="space-y-3">
                      {reporteFinanciero.egresosPorMetodo && Object.keys(reporteFinanciero.egresosPorMetodo).length > 0 ? (
                        Object.entries(reporteFinanciero.egresosPorMetodo).map(
                          ([metodo, total]) => (
                            <div
                              key={metodo}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="font-medium text-gray-900">
                                {metodo}
                              </span>
                              <span className="font-semibold text-gray-900">
                                {formatCurrency(total)}
                              </span>
                            </div>
                          )
                        )
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">
                          No hay egresos en este período
                        </p>
                      )}
                    </div>
                  </div>
                </Card>
              </div>

              <Card>
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Egresos por Categoría
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(
                      reporteFinanciero.egresosPorCategoria
                    ).map(([categoria, total]) => (
                      <div
                        key={categoria}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="font-medium text-gray-900">
                          {categoria}
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatCurrency(total)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* TRANSACCIONES DE INVENTARIO */}
              {reporteFinanciero.inventario && (
                <>
                  <Card>
                    <div className="p-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Transacciones de Inventario (Nevera)
                      </h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Compras de Productos</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {formatCurrency(reporteFinanciero.inventario.totalCompras)}
                          </p>
                        </div>
                        <div className="bg-green-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Ventas de Productos</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formatCurrency(reporteFinanciero.inventario.totalVentas)}
                          </p>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-1">Ganancia Neta</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {formatCurrency(reporteFinanciero.inventario.ganancia)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {Object.keys(reporteFinanciero.inventario.ventasPorMetodo).length > 0 && (
                    <Card>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          Ventas de Nevera por Método de Pago
                        </h3>
                        <div className="space-y-3">
                          {Object.entries(reporteFinanciero.inventario.ventasPorMetodo).map(
                            ([metodo, total]) => (
                              <div
                                key={metodo}
                                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                              >
                                <span className="font-medium text-gray-900">{metodo}</span>
                                <span className="font-semibold text-green-600">
                                  {formatCurrency(total)}
                                </span>
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    </Card>
                  )}
                </>
              )}

              {reporteFinanciero.detalleIngresos && reporteFinanciero.detalleIngresos.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detalle de Transacciones de Ingresos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Fecha
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Cliente
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Empleado
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Método
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteFinanciero.detalleIngresos.map((t) => (
                            <tr key={t.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {format(new Date(t.fecha), "dd/MM/yyyy HH:mm", {
                                  locale: es,
                                })}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {t.cliente || "Sin cliente"}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {t.empleado || "Sin empleado"}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    t.metodoPago === "EFECTIVO"
                                      ? "success"
                                      : "info"
                                  }
                                >
                                  {t.metodoPago}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-right text-gray-900">
                                {formatCurrency(t.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              )}

              {reporteFinanciero.detalleEgresos && reporteFinanciero.detalleEgresos.length > 0 && (
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Detalle de Transacciones de Egresos
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Fecha
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Concepto
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Categoría
                            </th>
                            <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                              Método
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {reporteFinanciero.detalleEgresos.map((t) => (
                            <tr key={t.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {format(new Date(t.fecha), "dd/MM/yyyy HH:mm", {
                                  locale: es,
                                })}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-900">
                                {t.concepto || "Sin concepto"}
                              </td>
                              <td className="py-3 px-4 text-sm text-gray-600">
                                {t.categoria || "Sin categoría"}
                              </td>
                              <td className="py-3 px-4">
                                <Badge
                                  variant={
                                    t.metodoPago === "EFECTIVO"
                                      ? "success"
                                      : "info"
                                  }
                                >
                                  {t.metodoPago}
                                </Badge>
                              </td>
                              <td className="py-3 px-4 text-sm font-semibold text-right text-red-600">
                                {formatCurrency(t.total)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          )}

          {/* REPORTE DE CLIENTES */}
          {reporteActivo === "clientes" && reporteClientes && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Clientes Nuevos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteClientes.resumen.clientesNuevos}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Clientes Activos
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {reporteClientes.resumen.clientesActivos}
                  </p>
                </Card>
                <Card className="p-6">
                  <h3 className="text-sm text-gray-600 mb-2">
                    Ticket Promedio
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(reporteClientes.resumen.ticketPromedio)}
                  </p>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Top 10 Clientes por Gasto
                    </h3>
                    <div className="space-y-3">
                      {reporteClientes.topClientes.map((cliente, index) => (
                        <div
                          key={cliente.clienteId}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 font-semibold text-sm">
                              {index + 1}
                            </span>
                            <div>
                              <p className="font-medium text-gray-900">
                                {cliente.nombre}
                              </p>
                              <p className="text-sm text-gray-500">
                                {cliente.cantidadCompras} compras
                              </p>
                            </div>
                          </div>
                          <span className="font-semibold text-gray-900">
                            {formatCurrency(cliente.totalGastado)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                <Card>
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Clientes Más Frecuentes
                    </h3>
                    <div className="space-y-3">
                      {reporteClientes.clientesFrecuentes.map(
                        (cliente, index) => (
                          <div
                            key={cliente.clienteId}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-semibold text-sm">
                                {index + 1}
                              </span>
                              <p className="font-medium text-gray-900">
                                {cliente.nombre}
                              </p>
                            </div>
                            <Badge variant="info">
                              {cliente.visitas} visitas
                            </Badge>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportesPage;