'use client';

import React from 'react';

export interface ReporteMenosVendidosProps {
  cargando: boolean;
  productos: Array<{
    nombreProducto: string;
    totalVendido: number | string;
  }>;
}

export const ReporteMenosVendidos: React.FC<ReporteMenosVendidosProps> = ({
  cargando,
  productos,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Cargando productos con menor rotación...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-base text-gray-900">
          Productos Menos Vendidos (Baja Rotación)
        </h3>
        <p className="text-xs text-gray-400">
          Identifica artículos con baja o nula salida comercial para evaluar promociones o descontinuación
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-600">
          <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
            <tr>
              <th scope="col" className="px-5 py-3.5 text-center w-16">#</th>
              <th scope="col" className="px-5 py-3.5">Producto</th>
              <th scope="col" className="px-5 py-3.5 text-right">Total Unidades Vendidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {productos.map((prod, index) => (
              <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-5 py-4 text-center font-bold text-gray-400">
                  {index + 1}
                </td>
                <td className="px-5 py-4 font-bold text-gray-900">
                  {prod.nombreProducto}
                </td>
                <td className="px-5 py-4 text-right font-bold text-gray-600">
                  {Number(prod.totalVendido)} unidades
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
