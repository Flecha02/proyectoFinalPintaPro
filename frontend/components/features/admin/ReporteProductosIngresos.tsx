'use client';

import React from 'react';

export interface ReporteProductosIngresosProps {
  cargando: boolean;
  productos: Array<{
    nombreProducto: string;
    totalGenerado: number | string;
  }>;
}

export const ReporteProductosIngresos: React.FC<ReporteProductosIngresosProps> = ({
  cargando,
  productos,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Cargando productos con mayores ingresos...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100">
        <h3 className="font-bold text-base text-gray-900">
          Productos que Han Generado Más Ingresos
        </h3>
        <p className="text-xs text-gray-400">
          Ordenados de mayor a menor recaudación acumulada en el período
        </p>
      </div>

      {productos.length === 0 ? (
        <p className="p-8 text-center text-xs text-gray-400">No hay ventas registradas en las fechas seleccionadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-5 py-3.5 text-center w-16">#</th>
                <th scope="col" className="px-5 py-3.5">Producto</th>
                <th scope="col" className="px-5 py-3.5 text-right">Total Generado (Q)</th>
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
                  <td className="px-5 py-4 text-right font-black text-emerald-600 text-base">
                    Q {Number(prod.totalGenerado).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
