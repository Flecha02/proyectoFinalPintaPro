'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AdminReportesPage() {
  const router = useRouter();

  // Administrador en turno
  const [nombreAdmin] = useState('Carlos Boch');

  // Tipo de reporte activo (1 al 7 según los requerimientos)
  const [tipoReporte, setTipoReporte] = useState<number>(1);

  // Filtros de fechas para los reportes 1, 2 y 3
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-10-31');

  // Búsqueda de factura para el requerimiento 7
  const [numFacturaBuscada, setNumFacturaBuscada] = useState('');
  const [facturaEncontrada, setFacturaEncontrada] = useState<any>(null);

  // Datos simulados para los reportes
  const [reporteMontos] = useState({
    total: 10000.00,
    efectivo: 5000.00,
    cheque: 3500.00,
    tarjeta: 1500.00,
  });

  const [productosDinero] = useState([
    { nombre: 'Pintura X', montoGenerado: 3825.10 },
    { nombre: 'Barniz A', montoGenerado: 3700.33 },
    { nombre: 'Rodillo B', montoGenerado: 1500.00 },
  ]);

  const [productosCantidad] = useState([
    { nombre: 'Pintura Y', cantidad: '10 galones' },
    { nombre: 'Pintura C', cantidad: '7 cubetas' },
    { nombre: 'Brocha 1"', cantidad: '5 brochas' },
  ]);

  const [inventarioActual] = useState([
    { codigo: 'P001', nombre: 'Pintura Acrílica Vinil', categoria: 'Vinil', stock: 15, precio: 125.00 },
    { codigo: 'P002', nombre: 'Barniz Marina', categoria: 'Barniz', stock: 8, precio: 85.50 },
    { codigo: 'P003', nombre: 'Brocha Profesional 3"', categoria: 'Accesorios', stock: 40, precio: 25.00 },
  ]);

  const [productosMenosVentas] = useState([
    { nombre: 'Sellador Especial', totalVendidos: 2 },
    { nombre: 'Lija para Madera #120', totalVendidos: 4 },
  ]);

  const [productosSinStock] = useState([
    { codigo: 'P009', nombre: 'Impermeabilizante Blanco 5Gal', categoria: 'Impermeabilizante', stock: 0, proveedor: 'QuimicaPro S.A.' },
    { codigo: 'P014', nombre: 'Espátula de Acero 4"', categoria: 'Accesorios', stock: 0, proveedor: 'Herramientas GT' },
  ]);

  // Simulación de base de datos de facturas (Requerimiento 7)
  const baseDatosFacturas: Record<string, any> = {
    'FAC-001': {
      numero: 'FAC-001',
      fecha: '2026-10-15',
      empleado: 'María Ponciano',
      cliente: 'Juan Pérez (NIT: 1234567-8)',
      pagos: [
        { metodo: 'Efectivo', monto: 300.00 },
        { metodo: 'Tarjeta', mnt: 250.00 }
      ],
      productos: [
        { nombre: 'Pintura Acrílica Vinil', cantidad: 2, subtotal: 250.00 },
        { nombre: 'Brocha Profesional 3"', cantidad: 2, subtotal: 50.00 },
      ],
      total: 550.00
    }
  };

  const buscarFactura = () => {
    const encontrada = baseDatosFacturas[numFacturaBuscada.trim().toUpperCase()];
    if (encontrada) {
      setFacturaEncontrada(encontrada);
    } else {
      setFacturaEncontrada(null);
      alert('No se encontró ninguna factura con ese número.');
    }
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
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
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
            </button>
          </nav>
        </div>
        <button 
          onClick={handleCerrarSesion} 
          className="p-3 bg-red-600 hover:bg-red-700 rounded-xl text-white shadow transition flex flex-col items-center gap-1" 
          title="Cerrar Sesión"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
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
                    <th>Categoría</th>
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
                      <td><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold">{item.stock} unidades</span></td>
                      <td className="text-right text-gray-800">Q {item.precio.toFixed(2)}</td>
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
                Informe de Productos con Menor Movimiento / Ventas[cite: 9]
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
                Productos Agotados (Requerimiento de Proveedores)[cite: 9]
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
                      <td><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs font-bold">0 Stock</span></td>
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
                <h3 className="font-bold text-base text-gray-800">Búsqueda de Factura por Número</h3>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Ej. FAC-001"
                    value={numFacturaBuscada}
                    onChange={(e) => setNumFacturaBuscada(e.target.value)}
                    className="input input-bordered input-sm flex-1 bg-gray-50 text-gray-900"
                  />
                  <button 
                    onClick={buscarFactura}
                    className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold border-none"
                  >
                    🔍 Buscar Factura
                  </button>
                </div>
              </div>

              {facturaEncontrada && (
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                  <div className="flex justify-between items-center border-b pb-3">
                    <div>
                      <h4 className="font-black text-lg text-gray-800">Factura: {facturaEncontrada.numero}[cite: 9]</h4>
                      <p className="text-xs text-gray-500">Emitida el {facturaEncontrada.fecha}</p>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700 font-bold px-3 py-1 rounded-lg">
                      Atendido por: {facturaEncontrada.empleado}[cite: 9]
                    </span>
                  </div>

                  <div className="text-xs text-gray-700 bg-gray-50 p-3 rounded-xl">
                    <p><span className="font-bold">Cliente:</span> {facturaEncontrada.cliente}</p>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">Productos Comprados</h5>
                    <div className="space-y-1">
                      {facturaEncontrada.productos.map((prod: any, idx: number) => (
                        <div key={idx} className="flex justify-between text-xs border-b pb-1">
                          <span>{prod.cantidad}x {prod.nombre}</span>
                          <span className="font-bold">Q {prod.subtotal.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-bold text-xs uppercase text-gray-500 mb-2">Medios de Pago Empleados[cite: 9]</h5>
                    <div className="flex gap-2">
                      {facturaEncontrada.pagos.map((p: any, idx: number) => (
                        <span key={idx} className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded border border-green-200">
                          {p.metodo}: Q {p.monto.toFixed(2)}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-3 flex justify-between font-black text-base">
                    <span>Total Facturado:</span>
                    <span className="text-green-600">Q {facturaEncontrada.total.toFixed(2)}</span>
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