'use client';

import React, { useState } from 'react';
import { Producto } from '../../../lib/types';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface PosProductGridProps {
  productos: Producto[];
  categorias: string[];
  onAgregar: (prod: Producto) => void;
  cargando?: boolean;
}

export const PosProductGrid: React.FC<PosProductGridProps> = ({
  productos,
  categorias,
  onAgregar,
  cargando = false,
}) => {
  const [busqueda, setBusqueda] = useState('');
  const [catSeleccionada, setCatSeleccionada] = useState('Todos');

  const productosFiltrados = productos.filter((p) => {
    const coincideCat = catSeleccionada === 'Todos' || p.nombreCategoria === catSeleccionada;
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      p.nombreProducto.toLowerCase().includes(q) ||
      p.codigoProducto.toLowerCase().includes(q) ||
      p.marcaProducto.toLowerCase().includes(q);
    return coincideCat && coincideBusqueda;
  });

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Buscador y Filtros */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs space-y-3">
        <Input
          placeholder="Buscar por nombre, código o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setCatSeleccionada('Todos')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              catSeleccionada === 'Todos'
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {categorias.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCatSeleccionada(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                catSeleccionada === cat
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Productos */}
      <div className="flex-1 overflow-y-auto">
        {cargando ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
            Cargando catálogo de productos...
          </div>
        ) : productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-sm font-bold text-gray-700">No hay productos disponibles</p>
            <p className="text-xs text-gray-400 mt-1">Verifica los filtros de búsqueda.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3.5">
            {productosFiltrados.map((prod) => (
              <div
                key={prod.idProducto}
                onClick={() => onAgregar(prod)}
                className="bg-white rounded-2xl border border-gray-100 p-4 shadow-xs hover:shadow-md hover:border-blue-200 transition-all cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-[11px] font-bold text-[#1e3a8a]">
                      {prod.codigoProducto}
                    </span>
                    <Badge variant="info" size="sm">{prod.nombreCategoria}</Badge>
                  </div>
                  <h3 className="font-bold text-sm text-gray-900 group-hover:text-[#1e3a8a] transition-colors line-clamp-2">
                    {prod.nombreProducto}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                    <span>{prod.marcaProducto}</span>
                    <span>·</span>
                    <span>{prod.descripcionMedida}</span>
                  </div>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block leading-none">Precio venta</span>
                    <span className="text-base font-black text-gray-900">
                      Q {Number(prod.precioVentaProducto).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="group-hover:bg-[#1e3a8a] group-hover:text-white group-hover:border-[#1e3a8a]"
                  >
                    + Agregar
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
