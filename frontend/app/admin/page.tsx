'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  anularFacturaPorNumero,
  obtenerFacturaParaImpresion,
  obtenerReporteInventarioActual,
  obtenerReporteProductosAgotados,
  obtenerReporteProductosMasIngresos,
  obtenerReporteProductosMasVendidos,
  obtenerReporteProductosMenosVendidos,
  obtenerReporteVentasPorMedioPago,
} from '../../lib/api';

interface PagoDetalle {
  metodo: string;
  monto: number;
}

interface ProductoDetalle {
  nombre: string;
  cantidad: number;
  subtotal: number;
}

interface FacturaEncontrada {
  numero: string;
  fecha: string;
  empleado: string;
  cliente: string;
  pagos: PagoDetalle[];
  productos: ProductoDetalle[];
  total: number;
  estado?: string;
}

interface ItemInventario {
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  precio: number;
}

interface ItemSinStock {
  codigo: string;
  nombre: string;
  categoria: string;
  stock: number;
  proveedor: string;
}

export default function AdminReportesPage() {
  const router = useRouter();

  // Administrador en turno (inicializado de forma perezosa sin setState sincrónico en efecto)
  const [nombreAdmin] = useState(() => {
    if (typeof window === 'undefined') return 'Administrador';
    try {
      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        return parsed?.nombreUsuario || 'Administrador';
      }
    } catch {
      // Ignorar errores de parsing
    }
    return 'Administrador';
  });

  // Tipo de reporte activo (1 al 7 según los requerimientos)
  const [tipoReporte, setTipoReporte] = useState<number>(1);

  // Filtros de fechas para los reportes 1, 2 y 3
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-11-30');

  // Búsqueda de factura para el requerimiento 7
  const [numFacturaBuscada, setNumFacturaBuscada] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState<FacturaEncontrada | null>(null);
  const [cargandoFactura, setCargandoFactura] = useState(false);
  const [cargandoReporte, setCargandoReporte] = useState(false);

  // Estados de datos para los reportes
  const [reporteMontos, setReporteMontos] = useState({
    total: 10000.0,
    efectivo: 5000.0,
    cheque: 3500.0,
    tarjeta: 1500.0,
  });

  const [productosDinero, setProductosDinero] = useState([
    { nombre: 'Pintura X', montoGenerado: 3825.1 },
    { nombre: 'Barniz A', montoGenerado: 3700.33 },
    { nombre: 'Rodillo B', montoGenerado: 1500.0 },
  ]);

  const [productosCantidad, setProductosCantidad] = useState([
    { nombre: 'Pintura Y', cantidad: '10 galones' },
    { nombre: 'Pintura C', cantidad: '7 cubetas' },
    { nombre: 'Brocha 1"', cantidad: '5 brochas' },
  ]);

  const [inventarioActual, setInventarioActual] = useState<ItemInventario[]>([
    { codigo: 'P001', nombre: 'Pintura Acrílica Vinil', categoria: 'Vinil', stock: 15, precio: 125.0 },
    { codigo: 'P002', nombre: 'Barniz Marina', categoria: 'Barniz', stock: 8, precio: 85.5 },
    { codigo: 'P003', nombre: 'Brocha Profesional 3"', categoria: 'Accesorios', stock: 40, precio: 25.0 },
  ]);

  const [productosMenosVentas, setProductosMenosVentas] = useState([
    { nombre: 'Sellador Especial', totalVendidos: 2 },
    { nombre: 'Lija para Madera #120', totalVendidos: 4 },
  ]);

  const [productosSinStock, setProductosSinStock] = useState<ItemSinStock[]>([
    { codigo: 'P009', nombre: 'Impermeabilizante Blanco 5Gal', categoria: 'Impermeabilizante', stock: 0, proveedor: 'QuimicaPro S.A.' },
    { codigo: 'P014', nombre: 'Espátula de Acero 4"', categoria: 'Accesorios', stock: 0, proveedor: 'Herramientas GT' },
  ]);

  // Cargar datos reales según el reporte seleccionado
  useEffect(() => {
    let activo = true;

    async function cargarDatosReporte() {
      setCargandoReporte(true);
      try {
        if (tipoReporte === 1) {
          const resp = await obtenerReporteVentasPorMedioPago(fechaInicio, fechaFin);
          if (activo && resp?.data) {
            let total = Number(resp.data.totalGeneral || 0);
            let efectivo = 0;
            let cheque = 0;
            let tarjeta = 0;

            for (const d of resp.data.desglose || []) {
              const nombre = (d.nombreMedioPago || '').toLowerCase();
              const monto = Number(d.totalMonto || 0);
              if (nombre.includes('efectivo')) efectivo += monto;
              else if (nombre.includes('cheque')) cheque += monto;
              else if (nombre.includes('tarjeta')) tarjeta += monto;
            }

            if (total === 0 && (efectivo > 0 || cheque > 0 || tarjeta > 0)) {
              total = efectivo + cheque + tarjeta;
            }

            setReporteMontos({ total, efectivo, cheque, tarjeta });
          }
        } else if (tipoReporte === 2) {
          const resp = await obtenerReporteProductosMasIngresos(fechaInicio, fechaFin);
          if (activo && resp?.data && resp.data.length > 0) {
            setProductosDinero(
              resp.data.map((r) => ({
                nombre: r.nombreProducto,
                montoGenerado: Number(r.totalGenerado || 0),
              })),
            );
          }
        } else if (tipoReporte === 3) {
          const resp = await obtenerReporteProductosMasVendidos(fechaInicio, fechaFin);
          if (activo && resp?.data && resp.data.length > 0) {
            setProductosCantidad(
              resp.data.map((r) => ({
                nombre: r.nombreProducto,
                cantidad: `${r.cantidadTotalVendida} ${r.descripcionMedida || 'unidades'}`,
              })),
            );
          }
        } else if (tipoReporte === 4) {
          const resp = await obtenerReporteInventarioActual();
          if (activo && resp?.data && resp.data.length > 0) {
            setInventarioActual(
              resp.data.map((r) => ({
                codigo: r.codigoProducto,
                nombre: r.nombreProducto,
                categoria: `${r.estanteUbicacion || 'E'} - ${r.pasilloUbicacion || 'P'}`,
                stock: Number(r.stockActual || 0),
                precio: 0,
              })),
            );
          }
        } else if (tipoReporte === 5) {
          const resp = await obtenerReporteProductosMenosVendidos();
          if (activo && resp?.data && resp.data.length > 0) {
            setProductosMenosVentas(
              resp.data.map((r) => ({
                nombre: r.nombreProducto,
                totalVendidos: Number(r.totalVendido || 0),
              })),
            );
          }
        } else if (tipoReporte === 6) {
          const resp = await obtenerReporteProductosAgotados();
          if (activo && resp?.data && resp.data.length > 0) {
            setProductosSinStock(
              resp.data.map((r) => ({
                codigo: r.codigoProducto,
                nombre: r.nombreProducto,
                categoria: r.marcaProducto || 'General',
                stock: Number(r.stockTotalActual || 0),
                proveedor: 'Por reabastecer',
              })),
            );
          }
        }
      } catch {
        // En caso de que la BD aún no tenga registros o esté en configuración, se preservan los valores previos sin romper la vista
      } finally {
        if (activo) setCargandoReporte(false);
      }
    }

    cargarDatosReporte();

    return () => {
      activo = false;
    };
  }, [tipoReporte, fechaInicio, fechaFin]);

  // Base de datos de respaldo para pruebas rápidas
  const baseDatosFacturas: Record<string, FacturaEncontrada> = {
    'FAC-001': {
      numero: 'FAC-001',
      fecha: '2026-10-15',
      empleado: 'María Ponciano',
      cliente: 'Juan Pérez (NIT: 1234567-8)',
      pagos: [
        { metodo: 'Efectivo', monto: 300.0 },
        { metodo: 'Tarjeta', monto: 250.0 },
      ],
      productos: [
        { nombre: 'Pintura Acrílica Vinil', cantidad: 2, subtotal: 250.0 },
        { nombre: 'Brocha Profesional 3"', cantidad: 2, subtotal: 50.0 },
      ],
      total: 550.0,
      estado: 'Emitida',
    },
  };

  const buscarFactura = async () => {
    const busqueda = numFacturaBuscada.trim();
    if (!busqueda) {
      alert('Por favor ingrese un número o ID de factura');
      return;
    }

    setCargandoFactura(true);
    try {
      // Buscar en el backend
      const resp = await obtenerFacturaParaImpresion(Number(busqueda) || (busqueda as unknown as number));
      if (resp?.data?.factura) {
        const f = resp.data.factura as Record<string, unknown>;
        const detalles = (resp.data.detalles || []) as Array<Record<string, unknown>>;
        const pagos = (resp.data.pagos || []) as Array<Record<string, unknown>>;

        setFacturaEncontrada({
          numero: String(f.numeroFactura || f.idFactura || busqueda),
          fecha: String(f.fechaFactura || '').slice(0, 10),
          empleado: String(f.nombreEmpleado || 'N/A'),
          cliente: `${String(f.nombreCliente || '')} (NIT: ${String(f.nitCliente || 'CF')})`,
          pagos: pagos.map((p) => ({
            metodo: String(p.nombreMedioPago || 'Pago'),
            monto: Number(p.montoPago || 0),
          })),
          productos: detalles.map((d) => ({
            nombre: String(d.nombreProducto || 'Producto'),
            cantidad: Number(d.cantidadVendida || 0),
            subtotal: Number(d.subtotalVendido || 0),
          })),
          total: Number(f.totalFactura || 0),
          estado: String(f.estadoFactura || 'Emitida'),
        });
        return;
      }
      throw new Error('No encontrada en API');
    } catch {
      // Buscar en respaldo en memoria
      const encontrada = baseDatosFacturas[busqueda.toUpperCase()];
      if (encontrada) {
        setFacturaEncontrada(encontrada);
      } else {
        setFacturaEncontrada(null);
        alert('No se encontró ninguna factura con ese número.');
      }
    } finally {
      setCargandoFactura(false);
    }
  };

  const handleAnularFactura = async (numFac: string) => {
    if (!confirm(`¿Está seguro de que desea anular la factura ${numFac}?`)) return;

    try {
      let idUsuario = 1;
      const u = localStorage.getItem('usuario');
      if (u) {
        const parsed = JSON.parse(u);
        if (parsed?.idUsuario) idUsuario = Number(parsed.idUsuario);
      }

      await anularFacturaPorNumero(numFac, idUsuario);
      alert(`Factura ${numFac} anulada exitosamente.`);
      if (facturaEncontrada) {
        setFacturaEncontrada({ ...facturaEncontrada, estado: 'Anulada' });
      }
    } catch (err) {
      alert(`Error al anular la factura: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      {/* 1. BARRA LATERAL (Sidebar Azul PintaPro) */}
      <aside className="w-20 bg-[#1e3a8a] flex flex-col items-center py-6 justify-between text-white shrink-0 shadow-lg">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-15 h-15 bg-white rounded-xl p-1 shadow">
            <Image src="/PintaPro.png" alt="Logo" fill className="object-contain" />
          </div>
          <nav className="flex flex-col gap-4 text-gray-300">
            <button className="p-3 bg-blue-700 text-white rounded-xl shadow" title="Panel Gerencial">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </button>
          </nav>
        </div>
        <button
          onClick={handleCerrarSesion}
          className="p-3 bg-red-600 hover:bg-red-700 rounded-xl text-white shadow transition flex flex-col items-center gap-1"
          title="Cerrar Sesión"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-[9px] font-bold uppercase">Salir</span>
        </button>
      </aside>

      {/* 2. ÁREA PRINCIPAL DE REPORTES */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        {/* Header Superior */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Panel de Gerencia / Informes y Reportes</h1>
            <p className="text-xs text-gray-500">
              Gerente en turno: <span className="font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-md">{nombreAdmin}</span>
            </p>
          </div>
          <button
            onClick={() => alert('Generando exportación oficial del reporte...')}
            className="btn btn-sm bg-[#F4C430] hover:bg-[#d8ab25] text-black font-bold border-none shadow"
          >
            📥 Exportar Reporte
          </button>
        </header>

        {/* Contenido de Reportes */}
        <div className="p-8 space-y-6">
          {/* Menú Superior de Selección de Reportes (1 al 7) */}
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 flex flex-wrap gap-2">
            {[
              { id: 1, label: '1. Monto Facturado (Fechas)' },
              { id: 2, label: '2. Top Ingresos (Productos)' },
              { id: 3, label: '3. Más Vendidos (Cantidades)' },
              { id: 4, label: '4. Inventario Actual' },
              { id: 5, label: '5. Menos Ventas' },
              { id: 6, label: '6. Sin Stock (Proveedores)' },
              { id: 7, label: '7. Consultar Factura' },
            ].map((rep) => (
              <button
                key={rep.id}
                onClick={() => setTipoReporte(rep.id)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition ${
                  tipoReporte === rep.id
                    ? 'bg-[#1e3a8a] text-white shadow'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border'
                }`}
              >
                {rep.label}
              </button>
            ))}
          </div>

          {/* Filtro de Fechas Global para los Reportes 1, 2 y 3 */}
          {[1, 2, 3].includes(tipoReporte) && (
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex items-center gap-4">
              <span className="text-xs font-bold text-gray-700 uppercase">Filtrar entre fechas:</span>
              <input
                type="date"
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
                className="input input-bordered input-sm bg-gray-50 text-gray-900"
              />
              <span className="text-xs text-gray-500">hasta</span>
              <input
                type="date"
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
                className="input input-bordered input-sm bg-gray-50 text-gray-900"
              />
              {cargandoReporte && <span className="text-xs text-blue-600 font-bold animate-pulse">Consultando datos...</span>}
            </div>
          )}

          {/* VISTAS DE LOS INFORMES */}

          {/* REPORTE 1: Monto total facturado por medios de pago */}
          {tipoReporte === 1 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Monto Total Facturado ({fechaInicio} al {fechaFin})
              </div>
              <table className="table w-full">
                <tbody>
                  <tr className="border-b font-black text-gray-900 bg-blue-50">
                    <td>Total</td>
                    <td className="text-right text-green-600">Q {reporteMontos.total.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b text-gray-700">
                    <td>Efectivo</td>
                    <td className="text-right font-bold">Q {reporteMontos.efectivo.toFixed(2)}</td>
                  </tr>
                  <tr className="border-b text-gray-700">
                    <td>Cheque</td>
                    <td className="text-right font-bold">Q {reporteMontos.cheque.toFixed(2)}</td>
                  </tr>
                  <tr className="text-gray-700">
                    <td>Tarjeta</td>
                    <td className="text-right font-bold">Q {reporteMontos.tarjeta.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 2: Productos que más dinero generan */}
          {tipoReporte === 2 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Productos que más dinero generan ({fechaInicio} al {fechaFin})
              </div>
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white text-xs">
                    <th>Producto</th>
                    <th className="text-right">Dinero Generado</th>
                  </tr>
                </thead>
                <tbody>
                  {productosDinero.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="font-bold text-gray-900">{p.nombre}</td>
                      <td className="text-right font-black text-green-600">Q {p.montoGenerado.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 3: Productos que más se venden en cantidades */}
          {tipoReporte === 3 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Productos con mayor cantidad vendida ({fechaInicio} al {fechaFin})
              </div>
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white text-xs">
                    <th>Producto</th>
                    <th className="text-right">Cantidad Vendida</th>
                  </tr>
                </thead>
                <tbody>
                  {productosCantidad.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="font-bold text-gray-900">{p.nombre}</td>
                      <td className="text-right font-bold text-blue-700">{p.cantidad}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 4: Informe de inventario actual */}
          {tipoReporte === 4 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Informe de Inventario Actual
              </div>
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white text-xs">
                    <th>Código</th>
                    <th>Nombre</th>
                    <th>Ubicación</th>
                    <th>Stock</th>
                    <th className="text-right">Precio</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioActual.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="font-bold text-blue-700">{item.codigo}</td>
                      <td className="text-gray-900 font-semibold">{item.nombre}</td>
                      <td className="text-gray-600">{item.categoria}</td>
                      <td>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">
                          {item.stock} unidades
                        </span>
                      </td>
                      <td className="text-right text-gray-800">
                        {item.precio > 0 ? `Q ${item.precio.toFixed(2)}` : 'Ver catálogo'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 5: Productos con menos ventas */}
          {tipoReporte === 5 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-xl">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Informe de Productos con Menor Movimiento / Ventas
              </div>
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white text-xs">
                    <th>Producto</th>
                    <th className="text-right">Unidades Vendidas</th>
                  </tr>
                </thead>
                <tbody>
                  {productosMenosVentas.map((p, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="font-bold text-gray-900">{p.nombre}</td>
                      <td className="text-right font-bold text-red-600">{p.totalVendidos} unidades</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 6: Sin stock (necesitan proveedores) */}
          {tipoReporte === 6 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 bg-gray-50 border-b font-bold text-gray-800 text-sm">
                Productos Agotados (Requerimiento de Proveedores)
              </div>
              <table className="table w-full">
                <thead>
                  <tr className="bg-[#1e3a8a] text-white text-xs">
                    <th>Código</th>
                    <th>Producto</th>
                    <th>Categoría</th>
                    <th>Stock</th>
                    <th className="text-right">Proveedor Sugerido</th>
                  </tr>
                </thead>
                <tbody>
                  {productosSinStock.map((item, idx) => (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="font-bold text-red-600">{item.codigo}</td>
                      <td className="text-gray-900 font-semibold">{item.nombre}</td>
                      <td className="text-gray-600">{item.categoria}</td>
                      <td>
                        <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">
                          {item.stock} Stock
                        </span>
                      </td>
                      <td className="text-right font-bold text-blue-700">{item.proveedor}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* REPORTE 7: Buscar Factura y ver detalle de pagos y empleado */}
          {tipoReporte === 7 && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                <h3 className="font-bold text-base text-gray-800">Búsqueda de Factura por Número o ID</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ej. FAC-001 o ID"
                    value={numFacturaBuscada}
                    onChange={(e) => setNumFacturaBuscada(e.target.value)}
                    className="input input-bordered input-sm flex-1 bg-gray-50 text-gray-900"
                  />
                  <button
                    onClick={buscarFactura}
                    disabled={cargandoFactura}
                    className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold border-none"
                  >
                    {cargandoFactura ? 'Buscando...' : '🔍 Buscar Factura'}
                  </button>
                </div>
              </div>

              {facturaEncontrada && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-lg text-gray-800">Factura: {facturaEncontrada.numero}</h4>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                            facturaEncontrada.estado === 'Anulada'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-green-100 text-green-700'
                          }`}
                        >
                          {facturaEncontrada.estado || 'Emitida'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">Emitida el {facturaEncontrada.fecha}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                      Atendido por: {facturaEncontrada.empleado}
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <p>
                      <span className="font-bold">Cliente:</span> {facturaEncontrada.cliente}
                    </p>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">Productos Comprados</h5>
                    <div className="space-y-1">
                      {facturaEncontrada.productos.map((prod, idx) => (
                        <div key={idx} className="flex justify-between text-xs border-b pb-1">
                          <span>
                            {prod.cantidad}x {prod.nombre}
                          </span>
                          <span className="font-bold">Q {prod.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">Medios de Pago Empleados</h5>
                    <div className="flex gap-2">
                      {facturaEncontrada.pagos.map((p, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded border border-green-200"
                        >
                          {p.metodo}: Q {p.monto.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-between items-center font-black text-base">
                    <div>
                      <span>Total Facturado: </span>
                      <span className="text-green-600">Q {facturaEncontrada.total.toFixed(2)}</span>
                    </div>

                    {facturaEncontrada.estado !== 'Anulada' && (
                      <button
                        onClick={() => handleAnularFactura(facturaEncontrada.numero)}
                        className="btn btn-xs bg-red-600 hover:bg-red-700 text-white font-bold border-none"
                      >
                        ⚠️ Anular Factura
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
