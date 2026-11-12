'use client';

import React from 'react';
import { Badge } from '../../ui/Badge';

export interface ItemAgotado {
  codigoProducto: string;
  nombreProducto: string;
  marcaProducto: string;
  stockTotalActual: number | string;
  stockMinimo: number | string;
}

export interface ReporteProductosAgotadosProps {
  cargando: boolean;
  productos: ItemAgotado[];
}

export const ReporteProductosAgotados: React.FC<ReporteProductosAgotadosProps> = ({
  cargando,
  productos,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Analizando productos agotados o en stock mínimo...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-base text-gray-900">
            Productos Agotados o en Stock Mínimo
          </h3>
          <p className="text-xs text-gray-400">
            Artículos cuyo inventario actual es menor o igual al umbral mínimo establecido
          </p>
        </div>
        <Badge variant={productos.length > 0 ? 'danger' : 'success'} size="md">
          {productos.length} {productos.length === 1 ? 'artículo crítico' : 'artículos críticos'}
        </Badge>
      </div>

      {productos.length === 0 ? (
        <div className="p-12 text-center text-emerald-600 font-semibold text-sm">
          ✓ Todos los productos cuentan con stock suficiente por encima de su umbral mínimo.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50/75 text-xs uppercase font-bold text-gray-500 border-b border-gray-100">
              <tr>
                <th scope="col" className="px-5 py-3.5">Código</th>
                <th scope="col" className="px-5 py-3.5">Producto</th>
                <th scope="col" className="px-5 py-3.5">Marca</th>
                <th scope="col" className="px-5 py-3.5 text-center">Stock Mínimo</th>
                <th scope="col" className="px-5 py-3.5 text-right">Stock Actual</th>
                <th scope="col" className="px-5 py-3.5 text-center">Alerta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {productos.map((item, idx) => {
                const stock = Number(item.stockTotalActual);
                const minimo = Number(item.stockMinimo);
                const estaAgotado = stock === 0;

                return (
                  <tr key={idx} className="hover:bg-red-50/30 transition-colors">
                    <td className="px-5 py-4 font-mono text-xs font-bold text-red-700">
                      {item.codigoProducto}
                    </td>
                    <td className="px-5 py-4 font-bold text-gray-900">
                      {item.nombreProducto}
                    </td>
                    <td className="px-5 py-4 text-gray-600">{item.marcaProducto}</td>
                    <td className="px-5 py-4 text-center font-semibold text-gray-500">
                      {minimo}
                    </td>
                    <td className="px-5 py-4 text-right font-black text-red-600 text-base">
                      {stock}
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge variant="danger" size="sm">
                        {estaAgotado ? 'Agotado (0)' : 'Bajo Mínimo'}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
