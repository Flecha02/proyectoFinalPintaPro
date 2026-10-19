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
  precio: number | string;
}

export default function ProductosDashboard() {
  const router = useRouter();
  
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, codigo: 'P001', nombre: 'Pintura Acrílica Vinil', categoria: 'Vinil', marca: 'PintaPro', color: 'Azul Rey', presentacion: 'Galón', precio: 125.00 },
    { id: 2, codigo: 'P002', nombre: 'Barniz Marina', categoria: 'Barniz', marca: 'LacaPlus', color: 'N/A', presentacion: 'Litro', precio: 85.50 },
    { id: 3, codigo: 'P003', nombre: 'Brocha Profesional', categoria: 'Accesorios', marca: 'ProBrush', color: 'N/A', presentacion: 'N/A', precio: 25.00 },
  ]);

  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');
  const [busqueda, setBusqueda] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto>({ 
    id: 0, codigo: '', nombre: '', categoria: '', marca: '', color: '', presentacion: '', precio: '' 
  });

  // Reglas de categoría, color y presentación
  const handleCategoriaChange = (nuevaCategoria: string) => {
    let nuevoColor = productoActual.color;
    let nuevaPresentacion = productoActual.presentacion;

    if (nuevaCategoria === 'Accesorios') {
      nuevoColor = 'N/A';
      nuevaPresentacion = 'N/A';
    } else if (nuevaCategoria === 'Barniz' || nuevaCategoria === 'Solventes') {
      nuevoColor = 'N/A';
      if (!['Galón', 'Litro', '1/4 de Galón'].includes(nuevaPresentacion)) {
        nuevaPresentacion = '';
      }
    } else {
      if (nuevoColor === 'N/A') nuevoColor = '';
      if (nuevaPresentacion === 'N/A') nuevaPresentacion = '';
    }

    setProductoActual({
      ...productoActual,
      categoria: nuevaCategoria,
      color: nuevoColor,
      presentacion: nuevaPresentacion,
    });
  };

  const obtenerOpcionesPresentacion = () => {
    const cat = productoActual.categoria;
    if (cat === 'Accesorios') return [{ value: 'N/A', label: 'N/A (No aplica)' }];
    if (cat === 'Barniz' || cat === 'Solventes') {
      return [
        { value: '1/32 de Galon', label: '1/32 de Galón' },
        { value: '1/16 de Galon', label: '1/16 de Galon' },
        {value: '1/8 de Galon', label: '1/8 de Galon'},
        { value: '1/4 de Galón', label: '1/4 de Galón' },
        {value: '1/2 de Galon', label: '1/2 de Galon'}
      ];
    }
    return [
    { value: '1/32 de Galon', label: '1/32 de Galón' },
        { value: '1/16 de Galon', label: '1/16 de Galon' },
        {value: '1/8 de Galon', label: '1/8 de Galon'},
        { value: '1/4 de Galón', label: '1/4 de Galón' },
        {value: '1/2 de Galon', label: '1/2 de Galon'},
        {value: 'Galon', label: 'Galon'},
        {value: 'Cubeta', label:  'Cubeta'},
        {value: 'Unidad', label: 'Unidad' },
    ];
  };

  const handleCerrarSesion = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  const abrirModalAgregar = () => {
    setModoEdicion(false);
    setProductoActual({ id: 0, codigo: '', nombre: '', categoria: '', marca: '', color: '', presentacion: '', precio: '' });
    setModalAbierto(true);
  };

  const abrirModalEditar = (prod: Producto) => {
    setModoEdicion(true);
    setProductoActual(prod);
    setModalAbierto(true);
  };

  const eliminarProducto = (id: number) => {
    if (confirm('¿Estás segura de eliminar este producto?')) {
      setProductos(productos.filter((p) => p.id !== id));
    }
  };

  const guardarProducto = (e: React.FormEvent) => {
    e.preventDefault();
    if (modoEdicion) {
      setProductos(productos.map((p) => (p.id === productoActual.id ? productoActual : p)));
    } else {
      const nuevo = { ...productoActual, id: Date.now() };
      setProductos([...productos, nuevo]);
    }
    setModalAbierto(false);
  };

  // Filtrado de productos
  const productosFiltrados = productos.filter((p) => {
    const coincideCategoria = categoriaSeleccionada === 'Todos' || p.categoria === categoriaSeleccionada;
    const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda.toLowerCase()) || p.codigo.toLowerCase().includes(busqueda.toLowerCase());
    return coincideCategoria && coincideBusqueda;
  });

  return (
    <div className="flex h-screen bg-gray-100 font-sans overflow-hidden">
      
      {/* 1. BARRA LATERAL (Sidebar Azul PintaPro) */}
      <aside className="w-20 bg-[#1e3a8a] flex flex-col items-center py-6 justify-between text-white shrink-0 shadow-lg">
        <div className="flex flex-col items-center gap-8">
          <div className="relative w-15 h-15 bg-white rounded-xl p-1 shadow">
            <Image src="/PintaPro.png" alt="Logo" fill className="object-contain" />
          </div>
          <nav className="flex flex-col gap-4 text-gray-300">
            <button className="p-3 bg-blue-700 text-white rounded-xl shadow"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/></svg></button>
            <button className="p-3 hover:bg-blue-800 rounded-xl transition"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg></button>
          </nav>
        </div>
        <button onClick={handleCerrarSesion} className="p-3 bg-red-600 hover:bg-red-700 rounded-xl text-white shadow transition" title="Cerrar Sesión">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
        </button>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Barra superior */}
        <header className="bg-white border-b px-8 py-4 flex items-center justify-between shadow-sm">
          <div>
            <h1 className="text-xl font-bold text-gray-800">Productos PintaPro</h1>
            <p className="text-xs text-gray-500">Gestión de catálogo</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-72">
              <input 
                type="text" 
                placeholder="Buscar por código o nombre..." 
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="input input-sm input-bordered w-full bg-gray-50 text-gray-900 pl-4"
              />
            </div>
            <button 
              onClick={abrirModalAgregar} 
              className="btn btn-sm bg-[#F4C430] hover:bg-[#d8ab25] text-black font-bold border-none shadow"
            >
              + Agregar Producto
            </button>
            <button
              onClick={() => router.push('/compras')}
              className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white border-none shadow"
            >
              Compras y bodega
            </button>
          </div>
        </header>

        {/* Cuerpo del Catálogo */}
        <div className="p-8 space-y-6">
          
          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Total Productos</p>
                <h3 className="text-2xl font-black text-gray-800 mt-1">{productos.length}</h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl font-bold"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Categorías Activas</p>
                <h3 className="text-2xl font-black text-gray-800 mt-1">6</h3>
              </div>
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-xl font-bold"></div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase">Sistema Operativo</p>
                <h3 className="text-2xl font-black text-green-600 mt-1">En Línea</h3>
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl font-bold">🟢</div>
            </div>
          </div>

          {/* Filtros de Categorías (Pestañas) */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['Pinturas', 'Barniz', 'Solventes', 'Accesorios'].map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaSeleccionada(cat)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition ${
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productosFiltrados.length > 0 ? (
              productosFiltrados.map((prod) => (
                <div key={prod.id} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 flex flex-col justify-between hover:shadow-md transition">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg">{prod.codigo}</span>
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2.5 py-1 rounded-lg">{prod.categoria}</span>
                    </div>
                    <h3 className="font-bold text-lg text-gray-900">{prod.nombre}</h3>
                    <p className="text-xs text-gray-500 mt-1">Marca: <span className="font-semibold text-gray-700">{prod.marca}</span></p>
                    <p className="text-xs text-gray-500">Color: <span className="font-semibold text-gray-700">{prod.color}</span> | Presentación: <span className="font-semibold text-gray-700">{prod.presentacion}</span></p>
                  </div>

                  <div className="mt-6 pt-4 border-t flex items-center justify-between">
                    <div>
                      <span className="text-xs text-gray-400 block">Precio</span>
                      <span className="text-xl font-black text-green-600">Q {Number(prod.precio).toFixed(2)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => abrirModalEditar(prod)}
                        className="btn btn-xs bg-blue-50 text-blue-600 hover:bg-blue-100 border-none font-semibold"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarProducto(prod.id)}
                        className="btn btn-xs bg-red-50 text-red-600 hover:bg-red-100 border-none font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center text-gray-400 bg-white rounded-2xl border">
                No se encontraron productos en esta categoría.
              </div>
            )}
          </div>

        </div>
      </main>

      {/* 3. MODAL CREAR / EDITAR PRODUCTO */}
      {modalAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 border relative">
            <h3 className="font-bold text-xl text-gray-800 mb-6 border-b pb-2">
              {modoEdicion ? 'Editar Producto / Precio' : 'Agregar Nuevo Producto'}
            </h3>

            <form onSubmit={guardarProducto} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Código</label>
                  <input 
                    type="text" 
                    value={productoActual.codigo}
                    onChange={(e) => setProductoActual({...productoActual, codigo: e.target.value})}
                    className="input input-bordered w-full text-gray-900 bg-gray-50 mt-1" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Nombre</label>
                  <input 
                    type="text" 
                    value={productoActual.nombre}
                    onChange={(e) => setProductoActual({...productoActual, nombre: e.target.value})}
                    className="input input-bordered w-full text-gray-900 bg-gray-50 mt-1" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Categoría</label>
                  <select 
                    value={productoActual.categoria}
                    onChange={(e) => handleCategoriaChange(e.target.value)}
                    className="select select-bordered w-full text-gray-900 bg-gray-50 mt-1 font-normal"
                    required
                  >
                    <option value="" disabled>Seleccione categoría</option>
                    <option value="Pintura">Pintura</option>
                    <option value="Barniz">Barniz</option>
                    <option value="Solventes">Solventes</option>
                    <option value="Accesorios">Accesorios</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Marca</label>
                  <input 
                    type="text" 
                    value={productoActual.marca}
                    onChange={(e) => setProductoActual({...productoActual, marca: e.target.value})}
                    className="input input-bordered w-full text-gray-900 bg-gray-50 mt-1" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Color</label>
                  <input 
                    type="text" 
                    value={productoActual.color}
                    onChange={(e) => setProductoActual({...productoActual, color: e.target.value})}
                    disabled={['Accesorios', 'Barniz', 'Solventes'].includes(productoActual.categoria)}
                    className="input input-bordered w-full text-gray-900 bg-gray-50 mt-1 disabled:bg-gray-200 disabled:text-gray-500 font-medium" 
                    placeholder={['Accesorios', 'Barniz', 'Solventes'].includes(productoActual.categoria) ? 'N/A' : 'Ej. Azul Rey'}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Presentación</label>
                  <select 
                    value={productoActual.presentacion}
                    onChange={(e) => setProductoActual({...productoActual, presentacion: e.target.value})}
                    disabled={productoActual.categoria === 'Accesorios'}
                    className="select select-bordered w-full text-gray-900 bg-gray-50 mt-1 font-normal disabled:bg-gray-200 disabled:text-gray-500"
                    required
                  >
                    <option value="" disabled>Presentación</option>
                    {obtenerOpcionesPresentacion().map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 uppercase">Precio (Q)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productoActual.precio}
                    onChange={(e) => setProductoActual({...productoActual, precio: e.target.value})}
                    className="input input-bordered w-full font-bold text-green-700 bg-gray-50 mt-1" 
                    required 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
                <button 
                  type="button" 
                  onClick={() => setModalAbierto(false)} 
                  className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-800 border-none font-semibold px-4"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn btn-sm bg-[#1e3a8a] hover:bg-blue-900 text-white px-5"
                >
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}