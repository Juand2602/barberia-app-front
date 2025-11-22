// src/pages/Inventario/InventarioPage.tsx

import React, { useEffect, useState } from 'react';
import { useInventarioStore } from '@/stores/inventarioStore';
import { Plus, ShoppingCart, Package, AlertTriangle, TrendingUp, DollarSign, Filter } from 'lucide-react';
import { Button } from '@components/ui/Button';
import { Card } from '@components/ui/Card';
import { Modal } from '@components/ui/Modal';
import { Badge } from '@components/ui/Badge';
import { ProductoInventarioForm } from '@components/forms/ProductoInventarioForm';
import { CompraInventarioForm } from '@components/forms/CompraInventarioForm';
import { VentaRapidaForm } from '@components/inventario/VentaRapidaForm';
import { StockAlerts } from '@components/inventario/StockAlerts';
import { ProductosInventarioTable } from '@components/tables/ProductosInventarioTable';
import { ProductoDetalle } from '@components/inventario/ProductoDetalle';
import { ProductoInventario } from '@/types/inventario.types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export const InventarioPage: React.FC = () => {
  const {
    productos,
    compras,
    ventas,
    estadisticas,
    productosStockBajo,
    loading,
    fetchProductos,
    fetchCompras,
    fetchVentas,
    fetchEstadisticas,
    fetchProductosStockBajo,
    createProducto,
    updateProducto,
    deleteProducto,
    registrarCompra,
    registrarVenta,
  } = useInventarioStore();

  const [modalProducto, setModalProducto] = useState(false);
  const [modalCompra, setModalCompra] = useState(false);
  const [modalVenta, setModalVenta] = useState(false);
  const [modalAlerts, setModalAlerts] = useState(false);
  const [productoEditando, setProductoEditando] = useState<ProductoInventario | undefined>();
  const [productoVisualizando, setProductoVisualizando] = useState<ProductoInventario | null>(null);

  // Filtros de transacciones
  const [tipoMovimiento, setTipoMovimiento] = useState<'TODOS' | 'COMPRAS' | 'VENTAS'>('TODOS');
  const [productoFiltro, setProductoFiltro] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTransacciones();
  }, [tipoMovimiento, productoFiltro]);

  const loadData = () => {
    fetchProductos();
    fetchEstadisticas();
    fetchProductosStockBajo();
    loadTransacciones();
  };

  const loadTransacciones = () => {
    const filtros: any = {};
    if (productoFiltro) filtros.productoId = productoFiltro;
    
    if (tipoMovimiento === 'TODOS' || tipoMovimiento === 'COMPRAS') {
      fetchCompras(filtros);
    }
    if (tipoMovimiento === 'TODOS' || tipoMovimiento === 'VENTAS') {
      fetchVentas(filtros);
    }
  };

  const handleCreateProducto = async (data: any) => {
    try {
      await createProducto(data);
      setModalProducto(false);
      alert('✅ Producto creado exitosamente');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateProducto = async (data: any) => {
    if (!productoEditando) return;
    try {
      await updateProducto(productoEditando.id, data);
      setModalProducto(false);
      setProductoEditando(undefined);
      alert('✅ Producto actualizado exitosamente');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteProducto = async (producto: ProductoInventario) => {
    if (!confirm(`¿Eliminar el producto "${producto.nombre}"?`)) return;
    try {
      await deleteProducto(producto.id);
      alert('✅ Producto eliminado exitosamente');
      loadData();
    } catch (error: any) {
      alert(`❌ ${error.response?.data?.message || 'Error al eliminar producto'}`);
    }
  };

  const handleRegistrarCompra = async (data: any) => {
    try {
      await registrarCompra(data);
      setModalCompra(false);
      alert('✅ Compra registrada exitosamente');
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRegistrarVentas = async (ventas: any[]) => {
    try {
      for (const venta of ventas) {
        await registrarVenta(venta);
      }
      setModalVenta(false);
      alert(`✅ ${ventas.length} venta(s) registrada(s) exitosamente`);
      loadData();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEditProducto = (producto: ProductoInventario) => {
    setProductoEditando(producto);
    setModalProducto(true);
  };

  const handleViewProducto = (producto: ProductoInventario) => {
    setProductoVisualizando(producto);
  };

  const handleComprarProducto = () => {
    // Abrir modal de compra
    setModalCompra(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Inventario de Nevera</h1>
        <p className="text-gray-600 mt-1">
          Gestión de productos, compras y ventas
        </p>
      </div>

      {/* Botones de acción */}
      <Card className="mb-6">
        <div className="flex justify-end gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              setProductoEditando(undefined);
              setModalProducto(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus size={20} />
            Nuevo Producto
          </Button>
          <Button
            variant="secondary"
            onClick={() => setModalCompra(true)}
            className="flex items-center gap-2"
          >
            <TrendingUp size={20} />
            Registrar Compra
          </Button>
          <Button
            variant="primary"
            onClick={() => setModalVenta(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
          >
            <ShoppingCart size={20} />
            Venta Rápida
          </Button>
        </div>
      </Card>

      {/* Estadísticas */}
      {estadisticas && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Productos</p>
                <p className="text-3xl font-bold text-gray-900">
                  {estadisticas.productosActivos}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Valor: {formatCurrency(estadisticas.valorTotalStock)}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Package className="text-blue-600" size={32} />
              </div>
            </div>
          </Card>

          <div 
            className="p-6 cursor-pointer hover:shadow-lg transition-shadow bg-white rounded-lg border"
            onClick={() => setModalAlerts(true)}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Stock Bajo</p>
                <p className="text-3xl font-bold text-red-600">
                  {estadisticas.productosStockBajo}
                </p>
                <p className="text-xs text-red-500 mt-1">
                  {estadisticas.productosStockBajo > 0 ? 'Click para ver' : 'Todo en orden'}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <AlertTriangle className="text-red-600" size={32} />
              </div>
            </div>
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Ventas</p>
                <p className="text-2xl font-bold text-green-600">
                  {formatCurrency(estadisticas.totalVentas)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Período actual
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <ShoppingCart className="text-green-600" size={32} />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancia Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  {formatCurrency(estadisticas.gananciaTotal)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Margen neto
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <DollarSign className="text-blue-600" size={32} />
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Producto más vendido */}
      {estadisticas?.productoMasVendido && (
        <Card className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 rounded-full">
              <Package className="text-purple-600" size={24} />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-600">🏆 Producto Más Vendido</p>
              <p className="font-bold text-lg text-gray-900">
                {estadisticas.productoMasVendido.producto.nombre}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Cantidad vendida</p>
              <p className="font-bold text-2xl text-purple-600">
                {estadisticas.productoMasVendido.cantidadVendida}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Ingresos</p>
              <p className="font-bold text-xl text-green-600">
                {formatCurrency(estadisticas.productoMasVendido.totalVentas)}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Alertas de Stock Bajo (compactas) */}
      {productosStockBajo.length > 0 && productosStockBajo.length <= 3 && (
        <div className="mb-6">
          <StockAlerts
            productos={productosStockBajo}
            onComprar={handleComprarProducto}
            onVerTodos={() => setModalAlerts(true)}
          />
        </div>
      )}

      {/* Tabla de Productos */}
      <Card className="mb-6">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Lista de Productos</h2>
            <div className="flex gap-2">
              {/* Filtros futuros */}
            </div>
          </div>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 mt-4">Cargando productos...</p>
            </div>
          ) : (
            <ProductosInventarioTable
              productos={productos}
              onView={handleViewProducto}
              onEdit={handleEditProducto}
              onDelete={handleDeleteProducto}
            />
          )}
        </div>
      </Card>

      {/* Sección de Transacciones */}
      <Card>
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Movimientos de Inventario</h2>
            
            {/* Filtros */}
            <div className="flex gap-3 items-center">
              <Filter size={18} className="text-gray-600" />
              
              <select
                value={tipoMovimiento}
                onChange={(e) => setTipoMovimiento(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="TODOS">Todos los movimientos</option>
                <option value="COMPRAS">Solo Compras</option>
                <option value="VENTAS">Solo Ventas</option>
              </select>

              <select
                value={productoFiltro}
                onChange={(e) => setProductoFiltro(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Todos los productos</option>
                {productos.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabla de Movimientos */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Fecha
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Tipo
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Producto
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Cantidad
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    Precio Unit.
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
                {/* Compras */}
                {(tipoMovimiento === 'TODOS' || tipoMovimiento === 'COMPRAS') &&
                  compras.map((compra) => (
                    <tr key={`compra-${compra.id}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {format(new Date(compra.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="info">COMPRA</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {compra.producto?.nombre || 'Producto eliminado'}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-semibold text-blue-600">
                        +{compra.cantidad}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {formatCurrency(compra.precioUnitario)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {compra.proveedor || '-'}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-blue-600">
                        {formatCurrency(compra.total)}
                      </td>
                    </tr>
                  ))}

                {/* Ventas */}
                {(tipoMovimiento === 'TODOS' || tipoMovimiento === 'VENTAS') &&
                  ventas.map((venta) => (
                    <tr key={`venta-${venta.id}`} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {format(new Date(venta.fecha), 'dd/MM/yyyy HH:mm', { locale: es })}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="success">VENTA</Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-900">
                        {venta.producto?.nombre || 'Producto eliminado'}
                      </td>
                      <td className="py-3 px-4 text-center text-sm font-semibold text-red-600">
                        -{venta.cantidad}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-gray-900">
                        {formatCurrency(venta.precioUnitario)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={venta.metodoPago === 'EFECTIVO' ? 'success' : 'default'}>
                          {venta.metodoPago}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-semibold text-green-600">
                        {formatCurrency(venta.total)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* Mensaje si no hay movimientos */}
            {compras.length === 0 && ventas.length === 0 && (
              <div className="text-center py-12">
                <Package className="mx-auto text-gray-400 mb-4" size={64} />
                <p className="text-gray-500 text-lg">No hay movimientos registrados</p>
                <p className="text-gray-400 text-sm mt-2">
                  Las compras y ventas aparecerán aquí
                </p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Modales */}
      <Modal
        isOpen={modalProducto}
        onClose={() => {
          setModalProducto(false);
          setProductoEditando(undefined);
        }}
        title={productoEditando ? 'Editar Producto' : 'Nuevo Producto'}
        size="lg"
      >
        <ProductoInventarioForm
          producto={productoEditando}
          onSubmit={productoEditando ? handleUpdateProducto : handleCreateProducto}
          onCancel={() => {
            setModalProducto(false);
            setProductoEditando(undefined);
          }}
          isLoading={loading}
        />
      </Modal>

      <Modal
        isOpen={modalCompra}
        onClose={() => setModalCompra(false)}
        title="Registrar Compra"
        size="lg"
      >
        <CompraInventarioForm
          onSubmit={handleRegistrarCompra}
          onCancel={() => setModalCompra(false)}
          isLoading={loading}
        />
      </Modal>

      <Modal
        isOpen={modalVenta}
        onClose={() => setModalVenta(false)}
        title="Venta Rápida"
        size="xl"
      >
        <VentaRapidaForm
          productos={productos}
          onSubmit={handleRegistrarVentas}
          onCancel={() => setModalVenta(false)}
          isLoading={loading}
        />
      </Modal>

      <Modal
        isOpen={modalAlerts}
        onClose={() => setModalAlerts(false)}
        title="Alertas de Stock"
        size="lg"
      >
        <StockAlerts
          productos={productosStockBajo}
          onComprar={() => {
            setModalAlerts(false);
            handleComprarProducto();
          }}
        />
      </Modal>

      {/* Modal de visualización de producto */}
      {productoVisualizando && (
        <Modal
          isOpen={!!productoVisualizando}
          onClose={() => setProductoVisualizando(null)}
          title="Detalle del Producto"
          size="xl"
        >
          <ProductoDetalle
            producto={productoVisualizando}
            onEliminar={async () => {
              setProductoVisualizando(null);
              await handleDeleteProducto(productoVisualizando);
            }}
            onCerrar={() => setProductoVisualizando(null)}
          />
        </Modal>
      )}
    </div>
  );
};