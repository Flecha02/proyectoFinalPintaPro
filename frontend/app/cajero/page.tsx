'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface Producto {
  id: number;
  codigo: string;
  nombre: string;
  categoria: string;
  marca: string;
  color: string;
  presentacion: string;
  precio: number;
}

interface ItemOrden extends Producto {
  cantidad: number;
}

export default function CajeroPage() {
  const router = useRouter();

  // Nombre del Cajero activo
  const [nombreCajero] = useState('María Ponciano');

  // Catálogo de Productos
  const [productos] = useState<Producto[]>([
    { id: 1, codigo: 'P001', nombre: 'Pintura Acrílica Vinil', categoria: 'Vinil', marca: 'PintaPro', color: 'Azul Rey', presentacion: 'Galón', precio: 125.00 },
    { id: 2, codigo: 'P002', nombre: 'Barniz Marina', categoria: 'Barniz', marca: 'LacaPlus', color: 'N/A', presentacion: 'Litro', precio: 85.50 },
    { id: 3, codigo: 'P003', nombre: 'Brocha Profesional 3"', categoria: 'Accesorios', marca: 'ProBrush', color: 'N/A', presentacion: 'N/A', precio: 25.00 },
    { id: 4, codigo: 'P004', nombre: 'Pintura de Aceite Brillante', categoria: 'Aceite', marca: 'PintaPro', color: 'Blanco', presentacion: 'Galón', precio: 140.00 },
    { id: 5, codigo: 'P005', nombre: 'Thinner Estándar', categoria: 'Solventes', marca: 'SolventX', color: 'N/A', presentacion: 'Litro', precio: 35.00 },
  ]);

  // Clientes para la búsqueda por NIT
  const [clientesRegistrados] = useState([
    { nit: '1234567-8', nombre: 'Juan', apellido: 'Pérez', telefono: '5555-1234', direccion: 'Zona 1, Quetzaltenango' },
    { nit: '9876543-2', nombre: 'María', apellido: 'López', telefono: '7761-4321', direccion: 'Zona 3, Quetzaltenango' },
    { nit: 'CF', nombre: 'Consumidor', apellido: 'Final', telefono: 'N/A', direccion: 'Ciudad' },
  ]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [orden, setOrden] = useState<ItemOrden[]>([]);
  
  // Estados para Cotización y Cliente
  const [modalCotizacion, setModalCotizacion] = useState(false);
  const [pasoConfirmacion, setPasoConfirmacion] = useState(false);
  const [nitBusqueda, setNitBusqueda] = useState('');
  const [clienteEncontrado, setClienteEncontrado] = useState(false);
  const [datosCliente, setDatosCliente] = useState({
    nombre: '',
    apellido: '',
    nit: '',
    direccion: '',
    telefono: '',
  });

  // Estados para el Modal de Cobro
  const [modalCobro, setModalCobro] = useState(false);
  const [metodoPago, setMetodoPago] = useState<'efectivo' | 'tarjeta' | 'cheque'>('efectivo');
  const [montoPagado, setMontoPagado] = useState<number | string>('');

  // Cierre de sesión
  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Agregar producto a la orden
  const agregarAOrden = (prod: Producto) => {
    const existe = orden.find((item) => item.id === prod.id);
    if (existe) {
      setOrden(
        orden.map((item) =>
          item.id === prod.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setOrden([...orden, { ...prod, cantidad: 1 }]);
    }
  };

  // Cambiar cantidad de un producto
  const cambiarCantidad = (id: number, delta: number) => {
    setOrden(
      orden
        .map((item) => {
          if (item.id === id) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemOrden[]
    );
  };

  // Eliminar un item completo
  const eliminarItemOrden = (id: number) => {
    setOrden(orden.filter((item) => item.id !== id));
  };

  // Totales
  const subtotal = orden.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  const total = subtotal;
  const cambio = Number(montoPagado) > total ? Number(montoPagado) - total : 0;

  // Filtrado de productos
  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  // Buscar cliente por NIT
  const buscarClientePorNit = () => {
    const encontrado = clientesRegistrados.find((c) => c.nit.trim().toLowerCase() === nitBusqueda.trim().toLowerCase());
    
    if (encontrado) {
      setDatosCliente({
        nombre: encontrado.nombre,
        apellido: encontrado.apellido,
        nit: encontrado.nit,
        direccion: encontrado.direccion,
        telefono: encontrado.telefono,
      });
      setClienteEncontrado(true);
    } else {
      alert('Cliente no encontrado. Puede ingresar los datos para registrar un nuevo cliente.');
      setDatosCliente({ nombre: '', apellido: '', nit: nitBusqueda, direccion: '', telefono: '' });
      setClienteEncontrado(false);
    }
  };

  const prepararNuevoCliente = () => {
    setNitBusqueda('');
    setDatosCliente({ nombre: '', apellido: '', nit: '', direccion: '', telefono: '' });
    setClienteEncontrado(false);
  };

  // Funciones de Cotización
  const abrirModalCotizacion = () => {
    setPasoConfirmacion(false);
    setNitBusqueda('');
    setClienteEncontrado(false);
    setDatosCliente({ nombre: '', apellido: '', nit: '', direccion: '', telefono: '' });
    setModalCotizacion(true);
  };

  const cerrarModalCotizacion = () => {
    setModalCotizacion(false);
    setPasoConfirmacion(false);
  };

  const handleConfirmarFinalCotizacion = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`¡Cotización generada exitosamente!\n\nCliente: ${datosCliente.nombre} ${datosCliente.apellido}\nNIT: ${datosCliente.nit}\nTeléfono: ${datosCliente.telefono}\nTotal: Q ${total.toFixed(2)}`);
    cerrarModalCotizacion();
  };

  // Funciones de Cobro
  const abrirModalCobro = () => {
    setMetodoPago('efectivo');
    setMontoPagado(total);
    setModalCobro(true);
  };

  const handleProcesarCobroFinal = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`¡Cobro Procesado Con Éxito!\n\nMétodo de Pago: ${metodoPago.toUpperCase()}\nTotal Cobrado: Q ${total.toFixed(2)}\nAtendido por: ${nombreCajero}`);
    setOrden([]);
    setModalCobro(false);
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
            <button className="p-3 bg-blue-700 text-white rounded-xl shadow" title="Punto de Venta / Caja">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
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

      {/* 2. ÁREA CENTRAL - CATÁLOGO DE PRODUCTOS */}
      <main className="flex-1 flex flex-col overflow-y-auto border-r border-gray-200">
        
        {/* Barra superior con identificación del Cajero */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Módulo de Caja</h1>
            <p className="text-xs text-gray-500">
              Cajero en turno: <span className="font-bold text-[#1e3a8a] bg-blue-50 px-2 py-0.5 rounded-md">{nombreCajero}</span>
            </p>
          </div>
          <div className="relative w-80">
            <input 
              type="text" 
              placeholder="Buscar producto por código o nombre..." 
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="input input-sm input-bordered w-full bg-gray-50 text-gray-900 pl-4"
            />
          </div>
        </header>

        {/* Contenido del catálogo */}
        <div className="p-6 space-y-6">
          
          {/* Pestañas de Categoría */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Todos', 'Pintura', 'Barniz', 'Solventes', 'Accesorios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shrink-0 ${
                  categoriaSeleccionada === cat 
                    ? 'bg-[#1e3a8a] text-white shadow' 
                    : 'bg-white text-gray-600 hover:bg-gray-100 border'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Cuadrícula de Productos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">{prod.codigo}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md">{prod.categoria}</span>
                    </div>
                    <h3 className="font-bold text-base text-gray-900 line-clamp-1">{prod.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-1">Marca: <span className="font-semibold text-gray-700">{prod.marca}</span></p>
                    <p className="text-xs text-gray-500">Color: <span className="font-semibold text-gray-700">{prod.color}</span> | Pres: <span className="font-semibold text-gray-700">{prod.presentacion}</span></p>
                  </div>

                  <div className="mt-4 pt-3 border-t flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block">Precio</span>
                      <span className="text-lg font-black text-green-600">Q {prod.precio.toFixed(2)}</span>
                    </div>
                    
                    <button 
                      onClick={() => agregarAOrden(prod)}
                      className="btn btn-sm bg-[#F4C430] hover:bg-[#d8ab25] text-black font-bold border-none shadow px-3"
                    >
                      + Agregar a la orden
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border">
                No hay productos que coincidan con la búsqueda.
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 3. PANEL LATERAL DERECHO (Orden de Venta / Cotización) */}
      <aside className="w-96 bg-white flex flex-col justify-between shrink-0 shadow-xl z-10">
        
        <div className="p-6 border-b flex items-center justify-between bg-gray-50">
          <div>
            <h2 className="font-bold text-lg text-gray-800">Orden Actual</h2>
            <p className="text-xs text-gray-500">Atendido por: {nombreCajero}</p>
          </div>
          <span className="text-xs font-bold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full">
            {orden.reduce((acc, item) => acc + item.cantidad, 0)} ítems
          </span>
        </div>

        {/* Lista de productos en la orden */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {orden.length > 0 ? (
            orden.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex-1 pr-3">
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">{item.nombre}</h4>
                  <p className="text-xs text-gray-500">Q {item.precio.toFixed(2)} c/u</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-lg bg-white">
                    <button 
                      onClick={() => cambiarCantidad(item.id, -1)} 
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 rounded-l-lg font-bold"
                    >
                      -
                    </button>
                    <span className="px-2 text-xs font-bold text-gray-800">{item.cantidad}</span>
                    <button 
                      onClick={() => cambiarCantidad(item.id, 1)} 
                      className="px-2 py-0.5 text-gray-600 hover:bg-gray-100 rounded-r-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                  
                  <span className="text-sm font-bold text-gray-900 w-16 text-right">
                    Q {(item.precio * item.cantidad).toFixed(2)}
                  </span>

                  <button 
                    onClick={() => eliminarItemOrden(item.id)}
                    className="text-red-400 hover:text-red-600 ml-1 text-xs font-bold"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 space-y-2">
              <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/></svg>
              <p className="text-sm font-medium">La orden está vacía</p>
            </div>
          )}
        </div>

        {/* Resumen de totales y Botones */}
        <div className="p-6 border-t bg-gray-50 space-y-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold text-gray-800">Q {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-gray-900 pt-2 border-t">
              <span>Total</span>
              <span className="text-green-600">Q {total.toFixed(2)}</span>
            </div>
          </div>

          <button 
            disabled={orden.length === 0}
            onClick={abrirModalCotizacion}
            className="btn btn-outline w-full border-[#1e3a8a] text-[#1e3a8a] hover:bg-[#1e3a8a] hover:text-white font-bold disabled:border-gray-200 disabled:text-gray-300"
          >
            📋 Generar Cotización
          </button>

          <button 
            disabled={orden.length === 0}
            onClick={abrirModalCobro}
            className="btn w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold border-none disabled:bg-gray-300 shadow"
          >
            💳 Cobrar Q {total.toFixed(2)}
          </button>
        </div>
      </aside>

      {/* 4. MODAL DE COTIZACIÓN Y DATOS DEL CLIENTE */}
      {modalCotizacion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">
                  {pasoConfirmacion ? 'DATOS DEL CLIENTE' : 'COTIZACIÓN DE COMPRA'}
                </h3>
                <p className="text-xs text-gray-500">PintaPro Guatemala</p>
              </div>
              <span className="text-xs bg-yellow-100 text-yellow-800 font-bold px-2.5 py-1 rounded-md">
                {pasoConfirmacion ? 'Paso 2 de 2' : 'Borrador'}
              </span>
            </div>

            {!pasoConfirmacion ? (
              <>
                <div className="text-xs text-gray-700 mb-4 space-y-1 bg-gray-50 p-3 rounded-xl border">
                  <p><span className="font-bold text-gray-900">Atendido por:</span> {nombreCajero}</p>
                  <p><span className="font-bold text-gray-900">Fecha:</span> {new Date().toLocaleDateString('es-GT')}</p>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 mb-4 pr-1">
                  {orden.map((item) => (
                    <div key={item.id} className="flex justify-between text-xs border-b pb-1 text-gray-800">
                      <span>{item.cantidad}x {item.nombre}</span>
                      <span className="font-bold text-gray-900">Q {(item.precio * item.cantidad).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-3 flex justify-between font-extrabold text-base text-gray-900 mb-6">
                  <span>Total Cotizado:</span>
                  <span className="text-green-600">Q {total.toFixed(2)}</span>
                </div>

                <div className="flex justify-end gap-2">
                  <button 
                    type="button"
                    onClick={cerrarModalCotizacion} 
                    className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none font-semibold"
                  >
                    Cerrar
                  </button>
                  <button 
                    type="button"
                    onClick={() => setPasoConfirmacion(true)} 
                    className="btn btn-sm bg-[#F4C430] hover:bg-[#d8ab25] text-black font-bold border-none shadow"
                  >
                    Confirmar Cotización
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                
                {/* Búsqueda por NIT */}
                <div className="bg-gray-50 p-3 rounded-xl border space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs font-bold text-gray-700 uppercase">Buscar Cliente Existente</span>
                    <button 
                      type="button" 
                      onClick={prepararNuevoCliente}
                      className="text-xs text-blue-700 hover:underline font-bold"
                    >
                      + Registrar Nuevo Cliente
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Ingrese NIT (ej. 1234567-8 o CF)"
                      value={nitBusqueda}
                      onChange={(e) => setNitBusqueda(e.target.value)}
                      className="input input-bordered input-sm flex-1 text-gray-900 bg-white"
                    />
                    <button 
                      type="button" 
                      onClick={buscarClientePorNit}
                      className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold border-none"
                    >
                      🔍 Buscar
                    </button>
                  </div>

                  {clienteEncontrado && (
                    <p className="text-[11px] font-bold text-green-700 bg-green-50 px-2 py-1 rounded border border-green-200">
                      ✓ Cliente encontrado en la base de datos.
                    </p>
                  )}
                </div>

                {/* Formulario Datos del Cliente */}
                <form onSubmit={handleConfirmarFinalCotizacion} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase">Nombre</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Juan"
                        value={datosCliente.nombre}
                        onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                        className="input input-bordered input-sm w-full text-gray-900 bg-gray-50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase">Apellido</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. Pérez"
                        value={datosCliente.apellido}
                        onChange={(e) => setDatosCliente({...datosCliente, apellido: e.target.value})}
                        className="input input-bordered input-sm w-full text-gray-900 bg-gray-50 mt-1"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase">NIT</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Ej. 1234567-8"
                        value={datosCliente.nit}
                        onChange={(e) => setDatosCliente({...datosCliente, nit: e.target.value})}
                        className="input input-bordered input-sm w-full text-gray-900 bg-gray-50 mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 uppercase">Teléfono</label>
                      <input 
                        type="tel" 
                        required
                        placeholder="Ej. 5555-1234"
                        value={datosCliente.telefono}
                        onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                        className="input input-bordered input-sm w-full text-gray-900 bg-gray-50 mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase">Dirección</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Ej. Zona 1, Quetzaltenango"
                      value={datosCliente.direccion}
                      onChange={(e) => setDatosCliente({...datosCliente, direccion: e.target.value})}
                      className="input input-bordered input-sm w-full text-gray-900 bg-gray-50 mt-1"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-4 mt-4 border-t">
                    <button 
                      type="button"
                      onClick={() => setPasoConfirmacion(false)} 
                      className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none font-semibold"
                    >
                      Volver
                    </button>
                    <button 
                      type="submit" 
                      className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold border-none shadow px-5"
                    >
                      💾 Finalizar Cotización
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* 5. MODAL DE PROCESAMIENTO DE PAGO */}
      {modalCobro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 border relative animate-in fade-in zoom-in duration-200">
            
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-800">PROCESAR COBRO</h3>
                <p className="text-xs text-gray-500">Seleccione el método de pago</p>
              </div>
              <span className="text-sm font-extrabold text-green-600 bg-green-50 px-3 py-1 rounded-lg">
                Q {total.toFixed(2)}
              </span>
            </div>

            <form onSubmit={handleProcesarCobroFinal} className="space-y-5">
              
              {/* Opciones de Método de Pago */}
              <div>
                <label className="text-xs font-bold text-gray-700 uppercase block mb-2">Método de Pago</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setMetodoPago('efectivo')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      metodoPago === 'efectivo'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    💵 Efectivo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('tarjeta')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      metodoPago === 'tarjeta'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    💳 Tarjeta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetodoPago('cheque')}
                    className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                      metodoPago === 'cheque'
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow'
                        : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    📝 Cheque
                  </button>
                </div>
              </div>

              {/* Detalle según Método de Pago */}
              {metodoPago === 'efectivo' && (
                <div className="bg-gray-50 p-4 rounded-xl border space-y-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase">Monto Recibido (Q)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      required
                      value={montoPagado}
                      onChange={(e) => setMontoPagado(e.target.value)}
                      className="input input-bordered w-full font-bold text-gray-900 text-lg bg-white mt-1"
                    />
                  </div>
                  <div className="flex justify-between items-center text-sm pt-2 border-t">
                    <span className="font-semibold text-gray-600">Cambio / Vuelto:</span>
                    <span className="font-black text-xl text-green-600">Q {cambio.toFixed(2)}</span>
                  </div>
                </div>
              )}

              {metodoPago === 'tarjeta' && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-xs text-blue-800 space-y-2">
                  <p className="font-bold">Pago con POS / Tarjeta</p>
                  <p>Por favor deslice o acerque la tarjeta en el POS de cobro.</p>
                </div>
              )}

              {metodoPago === 'cheque' && (
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 space-y-2">
                  <label className="text-xs font-bold text-gray-700 uppercase">No. de Cheque / Banco</label>
                  <input 
                    type="text" 
                    required
                    placeholder="Ej. Cheque #10402 - Banco Industrial"
                    className="input input-bordered input-sm w-full bg-white text-gray-900"
                  />
                </div>
              )}

              {/* Botones de Acción */}
              <div className="flex justify-end gap-2 pt-3 border-t">
                <button 
                  type="button"
                  onClick={() => setModalCobro(false)} 
                  className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none font-semibold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={metodoPago === 'efectivo' && Number(montoPagado) < total}
                  className="btn btn-sm bg-green-600 hover:bg-green-700 text-white font-bold border-none shadow px-6 disabled:bg-gray-300"
                >
                  Confirmar Cobro
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}