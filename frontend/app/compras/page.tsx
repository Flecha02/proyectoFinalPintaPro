'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  DetalleOrdenCompraApi,
  listarOrdenesCompra,
  listarProductos,
  listarProveedores,
  listarUbicacionesBodega,
  obtenerOrdenCompra,
  registrarIngresoBodega,
  registrarOrdenCompra,
  registrarProveedor,
} from '../../lib/api';

interface ProductoCompra {
  idProducto: number;
  nombreProducto: string;
  codigoProducto: string;
}

interface LineaCompra {
  idProducto: number;
  cantidadSolicitada: number;
  precioAcordado: number;
}

interface LineaIngreso extends DetalleOrdenCompraApi {
  idUbicacionBodega: number;
  codigoLote: string;
  cantidadRecibida: number;
  costoUnitario: number;
}

function usuarioActivo() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null');
  if (!usuario?.idUsuario) throw new Error('La sesión no contiene un usuario válido.');
  return Number(usuario.idUsuario);
}

export default function ComprasPage() {
  const router = useRouter();
  const [proveedores, setProveedores] = useState<Awaited<ReturnType<typeof listarProveedores>>['data']>([]);
  const [productos, setProductos] = useState<ProductoCompra[]>([]);
  const [ordenes, setOrdenes] = useState<Awaited<ReturnType<typeof listarOrdenesCompra>>['data']>([]);
  const [ubicaciones, setUbicaciones] = useState<Awaited<ReturnType<typeof listarUbicacionesBodega>>['data']>([]);
  const [proveedorId, setProveedorId] = useState('');
  const [lineas, setLineas] = useState<LineaCompra[]>([]);
  const [productoId, setProductoId] = useState('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [mostrarProveedor, setMostrarProveedor] = useState(false);
  const [nuevoProveedor, setNuevoProveedor] = useState({ nitProveedor: '', nombreProveedor: '', telefonoProveedor: '', direccionProveedor: '' });
  const [ordenIngreso, setOrdenIngreso] = useState<number | null>(null);
  const [lineasIngreso, setLineasIngreso] = useState<LineaIngreso[]>([]);
  const [documento, setDocumento] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [proveedoresRespuesta, productosRespuesta, ordenesRespuesta, ubicacionesRespuesta] = await Promise.all([
        listarProveedores(), listarProductos(), listarOrdenesCompra(), listarUbicacionesBodega(),
      ]);
      setProveedores(proveedoresRespuesta.data);
      setProductos(productosRespuesta.data.map((p) => ({ idProducto: p.idProducto, nombreProducto: p.nombreProducto, codigoProducto: p.codigoProducto })));
      setOrdenes(ordenesRespuesta.data);
      setUbicaciones(ubicacionesRespuesta.data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los datos.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    Promise.resolve().then(cargarDatos);
  }, []);

  const agregarLinea = () => {
    if (!productoId || Number(cantidad) <= 0 || Number(precio) < 0) {
      setError('Selecciona un producto e indica cantidad y precio válidos.');
      return;
    }
    setLineas([...lineas, { idProducto: Number(productoId), cantidadSolicitada: Number(cantidad), precioAcordado: Number(precio) }]);
    setProductoId(''); setCantidad(''); setPrecio(''); setError('');
  };

  const crearOrden = async (event: FormEvent) => {
    event.preventDefault();
    if (!proveedorId || lineas.length === 0) return setError('Selecciona un proveedor y agrega al menos un producto.');
    try {
      await registrarOrdenCompra({ idProveedor: Number(proveedorId), idUsuario: usuarioActivo(), detalles: lineas });
      setMensaje('Orden de compra creada correctamente.'); setLineas([]); setProveedorId(''); await cargarDatos();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo crear la orden.'); }
  };

  const crearProveedor = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await registrarProveedor(nuevoProveedor);
      setNuevoProveedor({ nitProveedor: '', nombreProveedor: '', telefonoProveedor: '', direccionProveedor: '' });
      setMostrarProveedor(false); setMensaje('Proveedor registrado correctamente.'); await cargarDatos();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo registrar el proveedor.'); }
  };

  const prepararIngreso = async (idOrden: number) => {
    try {
      const respuesta = await obtenerOrdenCompra(idOrden);
      setOrdenIngreso(idOrden);
      setLineasIngreso((respuesta.data.detalles || []).map((detalle) => ({
        ...detalle, idUbicacionBodega: ubicaciones[0]?.idUbicacionBodega || 0, codigoLote: '', cantidadRecibida: Number(detalle.cantidadSolicitada), costoUnitario: Number(detalle.precioAcordado),
      })));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la orden.'); }
  };

  const recibirIngreso = async (event: FormEvent) => {
    event.preventDefault();
    if (!ordenIngreso || !documento.trim() || lineasIngreso.some((l) => !l.codigoLote || l.cantidadRecibida <= 0 || !l.idUbicacionBodega)) {
      return setError('Completa documento, lote, ubicación y cantidades recibidas.');
    }
    try {
      await registrarIngresoBodega({ idOrdenCompra: ordenIngreso, idUsuario: usuarioActivo(), numeroDocumentoEntrega: documento, lotesIngreso: lineasIngreso.map((l) => ({ idProducto: l.idProducto, idUbicacionBodega: l.idUbicacionBodega, codigoLote: l.codigoLote, cantidadRecibida: l.cantidadRecibida, costoUnitario: l.costoUnitario })) });
      setMensaje('Ingreso a bodega registrado y stock actualizado.'); setOrdenIngreso(null); setDocumento(''); await cargarDatos();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo registrar el ingreso.'); }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6 text-gray-900">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div><h1 className="text-3xl font-black text-[#1e3a8a]">Compras e ingreso a bodega</h1><p className="text-sm text-gray-500">Gestiona proveedores, órdenes y recepción de lotes.</p></div>
          <button onClick={() => router.push('/productos')} className="rounded-lg bg-white px-4 py-2 font-semibold shadow">Catálogo de productos</button>
        </header>
        {(mensaje || error) && <div className={`rounded-lg p-3 ${error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{error || mensaje}</div>}
        <section className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl bg-white p-5 shadow lg:col-span-1">
            <div className="mb-4 flex items-center justify-between"><h2 className="text-xl font-bold">Proveedores</h2><button onClick={() => setMostrarProveedor(!mostrarProveedor)} className="rounded bg-blue-100 px-3 py-1 text-sm font-bold text-blue-800">+ Nuevo</button></div>
            {mostrarProveedor && <form onSubmit={crearProveedor} className="mb-4 space-y-2 border-b pb-4">
              {(['nitProveedor', 'nombreProveedor', 'telefonoProveedor', 'direccionProveedor'] as const).map((campo) => <input key={campo} required={campo === 'nitProveedor' || campo === 'nombreProveedor'} placeholder={campo.replace('Proveedor', ' proveedor')} value={nuevoProveedor[campo]} onChange={(e) => setNuevoProveedor({ ...nuevoProveedor, [campo]: e.target.value })} className="w-full rounded border p-2" />)}
              <button className="w-full rounded bg-[#1e3a8a] p-2 font-bold text-white">Guardar proveedor</button>
            </form>}
            <select value={proveedorId} onChange={(e) => setProveedorId(e.target.value)} className="mb-3 w-full rounded border p-2"><option value="">Seleccionar proveedor</option>{proveedores.map((p) => <option key={p.idProveedor} value={p.idProveedor}>{p.nombreProveedor} - {p.nitProveedor}</option>)}</select>
            <div className="space-y-2 text-sm">{proveedores.map((p) => <div key={p.idProveedor} className="rounded bg-gray-50 p-2"><b>{p.nombreProveedor}</b><br />NIT: {p.nitProveedor}</div>)}</div>
          </div>
          <form onSubmit={crearOrden} className="rounded-2xl bg-white p-5 shadow lg:col-span-2">
            <h2 className="mb-4 text-xl font-bold">Nueva orden de compra</h2>
            <div className="grid gap-3 md:grid-cols-4">
              <select value={productoId} onChange={(e) => setProductoId(e.target.value)} className="rounded border p-2 md:col-span-2"><option value="">Producto</option>{productos.map((p) => <option key={p.idProducto} value={p.idProducto}>{p.codigoProducto} - {p.nombreProducto}</option>)}</select>
              <input type="number" min="0.01" step="0.01" placeholder="Cantidad" value={cantidad} onChange={(e) => setCantidad(e.target.value)} className="rounded border p-2" />
              <input type="number" min="0" step="0.01" placeholder="Precio acordado" value={precio} onChange={(e) => setPrecio(e.target.value)} className="rounded border p-2" />
            </div>
            <button type="button" onClick={agregarLinea} className="mt-3 rounded bg-yellow-400 px-4 py-2 font-bold">Agregar producto</button>
            <div className="my-4 space-y-2">{lineas.map((l, index) => <div key={`${l.idProducto}-${index}`} className="flex justify-between rounded bg-gray-50 p-2 text-sm"><span>{productos.find((p) => p.idProducto === l.idProducto)?.nombreProducto}</span><span>{l.cantidadSolicitada} x Q {l.precioAcordado.toFixed(2)} <button type="button" onClick={() => setLineas(lineas.filter((_, i) => i !== index))} className="ml-2 text-red-600">Quitar</button></span></div>)}</div>
            <button disabled={cargando} className="rounded bg-[#1e3a8a] px-5 py-2 font-bold text-white disabled:opacity-50">Crear orden de compra</button>
          </form>
        </section>
        <section className="rounded-2xl bg-white p-5 shadow">
          <h2 className="mb-4 text-xl font-bold">Órdenes e ingreso a bodega</h2>
          <div className="space-y-3">{ordenes.map((orden) => <div key={orden.idOrdenCompra} className="flex flex-wrap items-center justify-between gap-3 rounded border p-3"><div><b>Orden #{orden.idOrdenCompra}</b><p className="text-sm text-gray-500">{orden.nombreProveedor} · {orden.estadoOrdenCompra}</p></div>{orden.estadoOrdenCompra !== 'Completada' && <button onClick={() => prepararIngreso(orden.idOrdenCompra)} className="rounded bg-green-600 px-3 py-2 text-sm font-bold text-white">Registrar ingreso</button>}</div>)}</div>
        </section>
        {ordenIngreso && <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 p-4"><form onSubmit={recibirIngreso} className="mx-auto max-w-4xl rounded-2xl bg-white p-6 shadow-2xl"><div className="mb-4 flex justify-between"><h2 className="text-xl font-bold">Ingreso a bodega · Orden #{ordenIngreso}</h2><button type="button" onClick={() => setOrdenIngreso(null)}>Cerrar</button></div><input required placeholder="Número de documento de entrega" value={documento} onChange={(e) => setDocumento(e.target.value)} className="mb-4 w-full rounded border p-2" /><div className="space-y-3">{lineasIngreso.map((l, i) => <div key={l.idDetalleOrdenCompra} className="grid gap-2 rounded border p-3 md:grid-cols-5"><span className="font-semibold">{l.nombreProducto}</span><input required placeholder="Código de lote" value={l.codigoLote} onChange={(e) => setLineasIngreso(lineasIngreso.map((x, j) => j === i ? { ...x, codigoLote: e.target.value } : x))} className="rounded border p-2" /><input required type="number" min="0.01" max={l.cantidadSolicitada} step="0.01" value={l.cantidadRecibida} onChange={(e) => setLineasIngreso(lineasIngreso.map((x, j) => j === i ? { ...x, cantidadRecibida: Number(e.target.value) } : x))} className="rounded border p-2" /><select required value={l.idUbicacionBodega} onChange={(e) => setLineasIngreso(lineasIngreso.map((x, j) => j === i ? { ...x, idUbicacionBodega: Number(e.target.value) } : x))} className="rounded border p-2">{ubicaciones.map((u) => <option key={u.idUbicacionBodega} value={u.idUbicacionBodega}>Estante {u.estanteUbicacion} · Pasillo {u.pasilloUbicacion}</option>)}</select><input required type="number" min="0" step="0.01" value={l.costoUnitario} onChange={(e) => setLineasIngreso(lineasIngreso.map((x, j) => j === i ? { ...x, costoUnitario: Number(e.target.value) } : x))} className="rounded border p-2" /></div>)}</div><button className="mt-5 rounded bg-green-600 px-5 py-2 font-bold text-white">Confirmar ingreso a bodega</button></form></div>}
      </div>
    </main>
  );
}
