'use client';

import React from 'react';
import { Badge } from '../../ui/Badge';

export interface ItemInventarioReporte {
  codigoProducto: string;
  nombreProducto: string;
  marcaProducto: string;
  descripcionMedida: string;
  estanteUbicacion: string;
  pasilloUbicacion: string;
  stockActual: number | string;
  stockMinimo: number | string;
}

export interface ReporteInventarioActualProps {
  cargando: boolean;
  inventario: ItemInventarioReporte[];
}

export const ReporteInventarioActual: React.FC<ReporteInventarioActualProps> = ({
  cargando,
  inventario,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Cargando inventario actual de bodega...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-base text-gray-900">
          Inventario Actual por Ubicación en Bodega
        </h3>
        <p className="text-xs text-gray-400">
          Stock disponible en tiempo real con estantes, pasillos y umbrales mínimos
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
            <tr>
              <th scope="col" className="px-5 py-3.5">Código</th>
              <th scope="col" className="px-5 py-3.5">Producto</th>
              <th scope="col" className="px-5 py-3.5">Marca / Medida</th>
              <th scope="col" className="px-5 py-3.5">Ubicación Bodega</th>
              <th scope="col" className="px-5 py-3.5 text-center">Stock Mínimo</th>
              <th scope="col" className="px-5 py-3.5 text-right">Stock Actual</th>
              <th scope="col" className="px-5 py-3.5 text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {inventario.map((item, idx) => {
              const actual = Number(item.stockActual);
              const minimo = Number(item.stockMinimo);
              const bajoStock = actual <= minimo;

              return (
                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 font-mono text-xs font-bold text-[#1e3a8a]">
                    {item.codigoProducto}
                  </td>
                  <td className="px-5 py-4 font-bold text-gray-900">
                    {item.nombreProducto}
                  </td>
                  <td className="px-5 py-4 text-gray-600">
                    {item.marcaProducto} · {item.descripcionMedida}
                  </td>
                  <td className="px-5 py-4 text-xs font-medium text-gray-700">
                    {item.estanteUbicacion} · {item.pasilloUbicacion}
                  </td>
                  <td className="px-5 py-4 text-center font-semibold text-gray-400">
                    {minimo}
                  </td>
                  <td className="px-5 py-4 text-right font-black text-gray-900 text-base">
                    {actual}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <Badge variant={bajoStock ? 'danger' : 'success'} size="sm">
                      {bajoStock ? 'Stock Crítico' : 'Disponible'}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
