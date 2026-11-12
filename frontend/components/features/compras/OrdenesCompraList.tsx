'use client';

import React from 'react';
import { OrdenCompra } from '../../../lib/types';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface OrdenesCompraListProps {
  ordenes: OrdenCompra[];
  cargando: boolean;
  onRegistrarIngreso: (orden: OrdenCompra) => void;
}

export const OrdenesCompraList: React.FC<OrdenesCompraListProps> = ({
  ordenes,
  cargando,
  onRegistrarIngreso,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center text-sm text-gray-500">
        Cargando órdenes de compra...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs">
      <div className="pb-4 border-b border-gray-100 mb-4">
        <h2 className="text-lg font-bold text-gray-900">Historial de Órdenes e Ingreso a Bodega</h2>
        <p className="text-xs text-gray-400">Control de entregas y recepción física en inventario</p>
      </div>

      <div className="space-y-3">
        {ordenes.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No hay órdenes de compra registradas.</p>
        ) : (
          ordenes.map((orden) => {
            const esCompletada = orden.estadoOrdenCompra === 'Completada';
            const totalRecibido = Number(orden.totalRecibido || 0);
            const totalSolicitado = Number(orden.totalSolicitado || 0);
            const esParcial = !esCompletada && totalRecibido > 0;

            return (
              <div
                key={orden.idOrdenCompra}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-gray-100 hover:border-gray-200 bg-white transition-all"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900 text-sm">
                      Orden #{orden.idOrdenCompra}
                    </span>
                    {esCompletada ? (
                      <Badge variant="success" size="sm">
                        Completada
                      </Badge>
                    ) : esParcial ? (
                      <Badge variant="info" size="sm">
                        Pendiente (Parcial)
                      </Badge>
                    ) : (
                      <Badge variant="warning" size="sm">
                        Pendiente
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-1">
                    <span className="font-semibold text-gray-700">{orden.nombreProveedor}</span>
                    {orden.nitProveedor && ` · NIT: ${orden.nitProveedor}`}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1">
                    <span>Fecha: {String(orden.fechaOrdenCompra).slice(0, 10)}</span>
                    {totalSolicitado > 0 && (
                      <span className={`font-medium ${esParcial ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                        Recepción: {totalRecibido} / {totalSolicitado} un.
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  {!esCompletada ? (
                    <Button
                      variant={esParcial ? 'primary' : 'success'}
                      size="sm"
                      onClick={() => onRegistrarIngreso(orden)}
                      icono={
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                      }
                    >
                      {esParcial ? 'Continuar Recepción' : 'Registrar Ingreso'}
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 inline-flex items-center gap-1">
                      ✓ Recibido en bodega (100%)
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
