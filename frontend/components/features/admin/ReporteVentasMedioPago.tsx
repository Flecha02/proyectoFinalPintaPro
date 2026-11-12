'use client';

import React from 'react';
import { Card } from '../../ui/Card';

export interface ReporteVentasMedioPagoProps {
  cargando: boolean;
  totalGeneral: number;
  desglose: Array<{
    nombreMedioPago: string;
    totalMonto: number | string;
  }>;
}

export const ReporteVentasMedioPago: React.FC<ReporteVentasMedioPagoProps> = ({
  cargando,
  totalGeneral,
  desglose,
}) => {
  if (cargando) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-sm text-gray-400">
        Cargando datos de ventas por medio de pago...
      </div>
    );
  }

  const iconos: Record<string, string> = {
    Efectivo: '💵',
    'Tarjeta de Crédito / Débito': '💳',
    Tarjeta: '💳',
    'Transferencia Bancaria': '🏦',
    Transferencia: '🏦',
    Cheque: '🧾',
  };

  return (
    <div className="space-y-6">
      {/* Tarjeta de Gran Total */}
      <div className="bg-gradient-to-r from-[#1e3a8a] to-[#1e40af] text-white p-6 sm:p-8 rounded-3xl shadow-sm">
        <span className="text-xs uppercase font-bold tracking-wider text-blue-200 block">
          Ingresos Totales en el Período
        </span>
        <div className="text-3xl sm:text-4xl font-black mt-2">
          Q {Number(totalGeneral).toFixed(2)}
        </div>
        <p className="text-xs text-blue-200 mt-1">
          Sumatoria de todas las facturas emitidas activas.
        </p>
      </div>

      {/* Tarjetas de Medios de Pago */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {desglose.map((item, idx) => {
          const monto = Number(item.totalMonto || 0);
          const porcentaje = totalGeneral > 0 ? (monto / totalGeneral) * 100 : 0;
          const icono = iconos[item.nombreMedioPago] || '💰';

          return (
            <Card key={idx} padding="md" className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xl">{icono}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                    {porcentaje.toFixed(1)}%
                  </span>
                </div>
                <h4 className="font-bold text-sm text-gray-800">{item.nombreMedioPago}</h4>
                <div className="text-2xl font-black text-gray-900 mt-2">
                  Q {monto.toFixed(2)}
                </div>
              </div>

              {/* Barra de progreso */}
              <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4 overflow-hidden">
                <div
                  className="bg-[#1e3a8a] h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(porcentaje, 100)}%` }}
                />
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
