'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { CartProvider, useCart } from '../../context/CartContext';
import { PosProductGrid } from '../../components/features/cajero/PosProductGrid';
import { PosCart } from '../../components/features/cajero/PosCart';
import { ModalCobro } from '../../components/features/cajero/ModalCobro';
import { ModalCotizacion } from '../../components/features/cajero/ModalCotizacion';
import { CotizacionesList } from '../../components/features/cajero/CotizacionesList';
import { AnularFacturaSection } from '../../components/features/cajero/AnularFacturaSection';
import { ClientesSection } from '../../components/features/cajero/ClientesSection';
import { TicketImpresion } from '../../components/features/cajero/TicketImpresion';
import { Cotizacion, Factura, Producto } from '../../lib/types';
import { listarCotizaciones, listarProductos, obtenerCotizacion } from '../../lib/api';
import { useToast } from '../../context/ToastContext';

function CajeroDashboardContent() {
  const { mostrarExito, mostrarError } = useToast();
  const { agregarProducto, cargarCotizacion } = useCart();

  const [vista, setVista] = useState<'pos' | 'cotizaciones' | 'clientes' | 'anular'>('pos');
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<string[]>([]);
  const [cotizaciones, setCotizaciones] = useState<Cotizacion[]>([]);
  const [cargando, setCargando] = useState(true);

  // Modales
  const [modalCobroAbierto, setModalCobroAbierto] = useState(false);
  const [modalCotizacionAbierto, setModalCotizacionAbierto] = useState(false);
  const [facturaParaImpresion, setFacturaParaImpresion] = useState<Factura | null>(null);

  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resProd, resCot] = await Promise.all([
        listarProductos().catch(() => null),
        listarCotizaciones().catch(() => null),
      ]);

      if (resProd?.data) {
        const prods: Producto[] = resProd.data.map((p) => ({
          idProducto: p.idProducto,
          codigoProducto: p.codigoProducto,
          nombreProducto: p.nombreProducto,
          nombreCategoria: p.nombreCategoria || 'General',
          marcaProducto: p.marcaProducto || 'PintaPro',
          colorProducto: p.colorProducto || 'N/A',
          descripcionMedida: p.descripcionMedida || 'Unidad',
          precioVentaProducto: Number(p.precioVentaProducto || 0),
        }));
        setProductos(prods);

        const cats = Array.from(new Set(prods.map((p) => p.nombreCategoria))).filter(Boolean);
        setCategorias(cats);
      }

      if (resCot?.data) {
        setCotizaciones(
          resCot.data.map((c) => ({
            idCotizacion: c.idCotizacion,
            idCliente: c.idCliente,
            idUsuario: c.idUsuario,
            nombreCliente: c.nombreCliente,
            nitCliente: c.nitCliente,
            fechaCotizacion: c.fechaCotizacion,
            totalCotizacion: Number(c.totalCotizacion || 0),
            estadoCotizacion: c.estadoCotizacion,
            detalles: (c.detalles || []).map((d) => ({
              idProducto: d.idProducto,
              codigoProducto: d.codigoProducto,
              nombreProducto: d.nombreProducto,
              descripcionMedida: d.descripcionMedida,
              cantidadCotizada: Number(d.cantidadCotizada),
              precioCotizado: Number(d.precioCotizado),
              subtotalCotizado: Number(d.subtotalCotizado || 0),
            })),
          }))
        );
      }
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Error al cargar datos del punto de venta',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCargarCotizacion = async (cot: Cotizacion) => {
    try {
      // Consultamos los detalles completos desde la API ya que el listado inicial no incluye líneas de producto
      const resp = await obtenerCotizacion(cot.idCotizacion);
      const data = resp.data;

      const cotizacionConDetalles: Cotizacion = {
        idCotizacion: data.idCotizacion,
        idCliente: data.idCliente,
        idUsuario: data.idUsuario,
        nombreCliente: data.nombreCliente,
        nitCliente: data.nitCliente,
        fechaCotizacion: data.fechaCotizacion,
        totalCotizacion: Number(data.totalCotizacion || 0),
        estadoCotizacion: data.estadoCotizacion,
        detalles: (data.detalles || []).map((d) => ({
          idDetalleCotizacion: d.idDetalleCotizacion,
          idCotizacion: data.idCotizacion,
          idProducto: d.idProducto,
          codigoProducto: d.codigoProducto,
          nombreProducto: d.nombreProducto,
          descripcionMedida: d.descripcionMedida,
          cantidadCotizada: Number(d.cantidadCotizada),
          precioCotizado: Number(d.precioCotizado),
          subtotalCotizado: Number(d.subtotalCotizado || 0),
        })),
      };

      cargarCotizacion(cotizacionConDetalles);
      setVista('pos');
      mostrarExito(
        `Cotización #${cot.idCotizacion} de ${cot.nombreCliente} cargada en caja con ${(cotizacionConDetalles.detalles || []).length} producto(s).`,
        'Cotización Cargada'
      );
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener los detalles de la cotización';
      mostrarError(msg, 'Fallo al Cargar');
    }
  };

  const handleFacturaExitosa = (fact: Factura) => {
    setFacturaParaImpresion(fact);
    setAlerta({
      tipo: 'success',
      mensaje: `Factura ${fact.numeroFactura} emitida exitosamente con descuento FIFO.`,
    });
    cargarDatos();
  };

  const handleCotizacionExitosa = (idCot: number) => {
    setAlerta({
      tipo: 'success',
      mensaje: `Cotización #${idCot} guardada y vigente.`,
    });
    cargarDatos();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full space-y-6">
      <PageHeader
        title="Punto de Venta y Caja"
        description="Emisión de facturas con descuento de inventario FIFO, cotizaciones y anulación de comprobantes."
        actions={
          <div className="flex items-center gap-1.5 bg-gray-100 p-1 rounded-xl">
            <Button
              variant={vista === 'pos' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setVista('pos')}
            >
              Caja / POS
            </Button>
            <Button
              variant={vista === 'cotizaciones' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setVista('cotizaciones')}
            >
              Cotizaciones
            </Button>
            <Button
              variant={vista === 'clientes' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setVista('clientes')}
            >
              Clientes
            </Button>
            <Button
              variant={vista === 'anular' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setVista('anular')}
            >
              Anular Factura
            </Button>
          </div>
        }
      />

      {alerta && (
        <Alert
          tipo={alerta.tipo}
          mensaje={alerta.mensaje}
          onDismiss={() => setAlerta(null)}
        />
      )}

      {vista === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <PosProductGrid
              productos={productos}
              categorias={categorias}
              onAgregar={agregarProducto}
              cargando={cargando}
            />
          </div>
          <div className="lg:col-span-1 sticky top-20">
            <PosCart
              onIniciarCobro={() => setModalCobroAbierto(true)}
              onIniciarCotizacion={() => setModalCotizacionAbierto(true)}
            />
          </div>
        </div>
      )}

      {vista === 'cotizaciones' && (
        <CotizacionesList
          cotizaciones={cotizaciones}
          cargando={cargando}
          onCargarAlPOS={handleCargarCotizacion}
        />
      )}

      {vista === 'clientes' && <ClientesSection />}

      {vista === 'anular' && <AnularFacturaSection />}

      <ModalCobro
        isOpen={modalCobroAbierto}
        onClose={() => setModalCobroAbierto(false)}
        onFacturaEmitida={handleFacturaExitosa}
      />

      <ModalCotizacion
        isOpen={modalCotizacionAbierto}
        onClose={() => setModalCotizacionAbierto(false)}
        onCotizacionExitosa={handleCotizacionExitosa}
      />

      <TicketImpresion
        isOpen={Boolean(facturaParaImpresion)}
        onClose={() => setFacturaParaImpresion(null)}
        factura={facturaParaImpresion}
      />
    </main>
  );
}

export default function CajeroPage() {
  return (
    <RoleGuard allowedRoles={['CAJERO', 'GERENTE', 'ADMIN', 'ADMINISTRADOR']}>
      <CartProvider>
        <CajeroDashboardContent />
      </CartProvider>
    </RoleGuard>
  );
}
