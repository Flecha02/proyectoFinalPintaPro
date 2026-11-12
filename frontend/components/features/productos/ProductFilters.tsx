'use client';

import React from 'react';
import { Input } from '../../ui/Input';

export interface ProductFiltersProps {
  busqueda: string;
  onBusquedaChange: (val: string) => void;
  categoriaSeleccionada: string;
  onCategoriaChange: (cat: string) => void;
  categorias: string[];
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  busqueda,
  onBusquedaChange,
  categoriaSeleccionada,
  onCategoriaChange,
  categorias,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
      {/* Input de búsqueda */}
      <div className="w-full md:max-w-md">
        <Input
          placeholder="Buscar por código, nombre o marca..."
          value={busqueda}
          onChange={(e) => onBusquedaChange(e.target.value)}
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          }
        />
      </div>

      {/* Botones de categoría */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
        <button
          type="button"
          onClick={() => onCategoriaChange('Todos')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            categoriaSeleccionada === 'Todos'
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
            onClick={() => onCategoriaChange(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              categoriaSeleccionada === cat
                ? 'bg-[#1e3a8a] text-white shadow-xs'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>
    </div>
  );
};
