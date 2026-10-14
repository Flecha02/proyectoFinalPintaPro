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

export default function ProductosPage() {
  const router = useRouter();
  
  const [productos, setProductos] = useState<Producto[]>([
    { id: 1, codigo: 'P001', nombre: 'Pintura Acrílica', categoria: 'Vinil', marca: 'PintaPro', color: 'Azul Rey', presentacion: 'Galón', precio: 125.00 },
    { id: 2, codigo: 'P002', nombre: 'Barniz Marina', categoria: 'Madera', marca: 'LacaPlus', color: 'Transparente', presentacion: 'Litro', precio: 85.50 },
  ]);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);
  const [productoActual, setProductoActual] = useState<Producto>({ 
    id: 0, codigo: '', nombre: '', categoria: '', marca: '', color: '', presentacion: '', precio: '' 
  });

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

  return (
    <div className="min-h-screen bg-[#FFFDF0] p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="relative w-20 h-20">
              <Image src="/PintaPro.png" alt="Logo PintaPro" fill className="object-contain" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold tracking-wider text-black uppercase">PRODUCTOS</h1>

          <div className="flex items-center gap-3">
            <button 
              onClick={abrirModalAgregar}
              className="btn bg-[#F4C430] hover:bg-[#d8ab25] text-black font-bold border-none shadow-md px-6"
            >
              Agregar Producto
            </button>
            <button 
              onClick={handleCerrarSesion}
              className="btn bg-red-600 hover:bg-red-700 text-white font-semibold border-none shadow px-5"
            >
              Cerrar Sesión
            </button>
          </div>
        </div>

        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-gray-200">
          <table className="table w-full">
            <thead>
              <tr className="bg-[#3B5998] text-white text-base">
                <th>Codigo</th>
                <th>Nombre</th>
                <th>Categoria</th>
                <th>Marca</th>
                <th>Color</th>
                <th>Presentacion</th>
                <th>Precio</th>
                <th className="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {productos.length > 0 ? (
                productos.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 border-b">
                    <td className="font-semibold text-gray-900">{prod.codigo}</td>
                    <td className="text-gray-700">{prod.nombre}</td>
                    <td className="text-gray-700">{prod.categoria}</td>
                    <td className="text-gray-700">{prod.marca}</td>
                    <td className="text-gray-700">{prod.color}</td>
                    <td className="text-gray-700">{prod.presentacion}</td>
                    <td className="font-bold text-green-600">Q {Number(prod.precio).toFixed(2)}</td>
                    <td className="text-center space-x-2">
                      <button 
                        onClick={() => abrirModalEditar(prod)} 
                        className="text-blue-600 hover:underline font-semibold text-sm"
                      >
                        Editar
                      </button>
                      <button 
                        onClick={() => eliminarProducto(prod.id)} 
                        className="text-red-500 hover:underline font-semibold text-sm"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center py-6 text-gray-400">
                    No hay productos registrados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalAbierto && (
        <div className="modal modal-open">
          <div className="modal-box bg-white rounded-2xl shadow-2xl">
            <h3 className="font-bold text-lg text-gray-800 mb-4">
              {modoEdicion ? 'Editar Producto / Precio' : 'Agregar Nuevo Producto'}
            </h3>
            <form onSubmit={guardarProducto} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Código</label>
                  <input 
                    type="text" 
                    value={productoActual.codigo}
                    onChange={(e) => setProductoActual({...productoActual, codigo: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                    required 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Nombre</label>
                  <input 
                    type="text" 
                    value={productoActual.nombre}
                    onChange={(e) => setProductoActual({...productoActual, nombre: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                    required 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Categoría</label>
                  <input 
                    type="text" 
                    value={productoActual.categoria}
                    onChange={(e) => setProductoActual({...productoActual, categoria: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Marca</label>
                  <input 
                    type="text" 
                    value={productoActual.marca}
                    onChange={(e) => setProductoActual({...productoActual, marca: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600">Color</label>
                  <input 
                    type="text" 
                    value={productoActual.color}
                    onChange={(e) => setProductoActual({...productoActual, color: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Presentación</label>
                  <input 
                    type="text" 
                    value={productoActual.presentacion}
                    onChange={(e) => setProductoActual({...productoActual, presentacion: e.target.value})}
                    className="input input-bordered w-full input-sm text-gray-800" 
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600">Precio (Q)</label>
                  <input 
                    type="number" 
                    step="0.01"
                    value={productoActual.precio}
                    onChange={(e) => setProductoActual({...productoActual, precio: e.target.value})}
                    className="input input-bordered w-full input-sm font-bold text-green-700" 
                    required 
                  />
                </div>
              </div>

              <div className="modal-action mt-6">
                <button type="button" onClick={() => setModalAbierto(false)} className="btn btn-ghost btn-sm">
                  Cancelar
                </button>
                <button type="submit" className="btn bg-[#3B5998] hover:bg-[#2d4373] text-white btn-sm">
                  {modoEdicion ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <footer className="text-center text-xs text-gray-400 mt-8">
        PintaPro Proyecto Final &copy; 2026
      </footer>
    </div>
  );
}