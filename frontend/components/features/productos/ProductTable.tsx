'use client';

import React from 'react';
import { Producto } from '../../../lib/types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface ProductTableProps {
  productos: Producto[];
  cargando: boolean;
  onEditar: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  productos,
  cargando,
  onEditar,
  onEliminar,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-medium">Cargando inventario de productos...</p>
      </div>
    );
  }

  if (productos.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
        <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <h3 className="text-base font-bold text-gray-800">No se encontraron productos</h3>
        <p className="text-xs text-gray-500 mt-1">Intenta con otro filtro de búsqueda o categoría.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
            <tr>
              <th scope="col" className="px-5 py-3.5">Código</th>
              <th scope="col" className="px-5 py-3.5">Nombre</th>
              <th scope="col" className="px-5 py-3.5">Categoría</th>
              <th scope="col" className="px-5 py-3.5">Marca</th>
              <th scope="col" className="px-5 py-3.5">Color</th>
              <th scope="col" className="px-5 py-3.5">Presentación</th>
              <th scope="col" className="px-5 py-3.5 text-right">Precio</th>
              <th scope="col" className="px-5 py-3.5 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((p) => (
              <tr key={p.idProducto} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 font-mono text-xs font-bold text-[#1e3a8a]">
                  {p.codigoProducto}
                </td>
                <td className="px-5 py-4 font-semibold text-gray-900">
                  {p.nombreProducto}
                </td>
                <td className="px-5 py-4">
                  <Badge variant="info" size="sm">{p.nombreCategoria}</Badge>
                </td>
                <td className="px-5 py-4 text-gray-700">{p.marcaProducto}</td>
                <td className="px-5 py-4 text-gray-600">
                  {p.colorProducto && p.colorProducto !== 'N/A' ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full border border-gray-300 bg-gray-200" />
                      {p.colorProducto}
                    </span>
                  ) : (
                    <span className="text-gray-400">N/A</span>
                  )}
                </td>
                <td className="px-5 py-4 text-gray-600">{p.descripcionMedida}</td>
                <td className="px-5 py-4 text-right font-bold text-gray-900">
                  Q {Number(p.precioVentaProducto).toFixed(2)}
                </td>
                <td className="px-5 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditar(p)}
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                      aria-label="Editar producto"
                    >
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEliminar(p)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50"
                      aria-label="Eliminar producto"
                    >
                      Eliminar
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
