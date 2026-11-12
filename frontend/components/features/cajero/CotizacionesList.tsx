'use client';

import React, { useState } from 'react';
import { Cotizacion } from '../../../lib/types';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Button } from '../../ui/Button';

export interface CotizacionesListProps {
  cotizaciones: Cotizacion[];
  cargando: boolean;
  onCargarAlPOS: (cot: Cotizacion) => void;
}

export const CotizacionesList: React.FC<CotizacionesListProps> = ({
  cotizaciones,
  cargando,
  onCargarAlPOS,
}) => {
  const [busqueda, setBusqueda] = useState('');

  const cotizacionesFiltradas = cotizaciones.filter((c) => {
    const q = busqueda.toLowerCase();
    const cliente = (c.nombreCliente || '').toLowerCase();
    const nit = (c.nitCliente || '').toLowerCase();
    const id = String(c.idCotizacion);
    return cliente.includes(q) || nit.includes(q) || id.includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <h2 className="text-lg font-black text-gray-900">Cotizaciones Registradas</h2>
          <p className="text-xs text-gray-400">Selecciona una cotización para cargarla y facturarla</p>
        </div>
        <div className="w-full sm:w-64">
          <Input
            placeholder="Buscar por cliente, NIT o #"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
        </div>
      </div>

      {cargando ? (
        <div className="p-8 text-center text-sm text-gray-400">Cargando cotizaciones...</div>
      ) : cotizacionesFiltradas.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-400">No hay cotizaciones disponibles.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {cotizacionesFiltradas.map((cot) => {
            const esVigente = cot.estadoCotizacion === 'Vigente';
            return (
              <div
                key={cot.idCotizacion}
                className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-blue-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono text-xs font-bold text-[#1e3a8a]">
                      Cotización #{cot.idCotizacion}
                    </span>
                    <Badge variant={esVigente ? 'success' : 'neutral'} size="sm">
                      {cot.estadoCotizacion}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 line-clamp-1">
                    {cot.nombreCliente}
                  </h4>
                  <p className="text-xs text-gray-500">NIT: {cot.nitCliente || 'CF'}</p>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Fecha: {String(cot.fechaCotizacion).slice(0, 10)}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-base font-black text-gray-900">
                    Q {Number(cot.totalCotizacion).toFixed(2)}
                  </span>
                  {esVigente ? (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => onCargarAlPOS(cot)}
                    >
                      Cargar a Caja
                    </Button>
                  ) : (
                    <span className="text-xs font-semibold text-gray-400">Ya Facturada</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
