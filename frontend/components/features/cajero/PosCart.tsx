'use client';

import React from 'react';
import { useCart } from '../../../context/CartContext';
import { Button } from '../../ui/Button';

export interface PosCartProps {
  onIniciarCobro: () => void;
  onIniciarCotizacion: () => void;
}

export const PosCart: React.FC<PosCartProps> = ({
  onIniciarCobro,
  onIniciarCotizacion,
}) => {
  const {
    items,
    cambiarCantidad,
    eliminarItem,
    vaciarCarrito,
    subtotal,
    total,
    cotizacionOrigen,
  } = useCart();

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-5 flex flex-col h-full">
      {/* Cabecera del Carrito */}
      <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-3">
        <div>
          <h2 className="text-lg font-black text-gray-900">Venta Actual</h2>
          {cotizacionOrigen ? (
            <span className="text-xs font-semibold text-emerald-600">
              Cotización #{cotizacionOrigen.idCotizacion} ({cotizacionOrigen.nombreCliente})
            </span>
          ) : (
            <span className="text-xs text-gray-400">Items en orden: {items.length}</span>
          )}
        </div>
        {items.length > 0 && (
          <button
            type="button"
            onClick={vaciarCarrito}
            className="text-xs text-red-500 hover:text-red-700 font-semibold cursor-pointer"
          >
            Vaciar
          </button>
        )}
      </div>

      {/* Lista de Items */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[160px]">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
            <svg className="w-10 h-10 mb-2 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-xs font-medium">El carrito está vacío</p>
            <p className="text-[11px] text-gray-300">Haz clic en los productos para agregarlos.</p>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.idProducto}
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-gray-200 transition-all flex flex-col gap-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-gray-900 leading-tight">
                    {item.nombreProducto}
                  </h4>
                  <span className="text-[11px] text-gray-500 font-mono">
                    {item.codigoProducto} · Q {Number(item.precioVentaProducto).toFixed(2)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => eliminarItem(item.idProducto)}
                  className="text-gray-300 hover:text-red-500 text-xs font-bold p-1 cursor-pointer"
                  aria-label="Eliminar"
                >
                  ✕
                </button>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.idProducto, -1)}
                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-gray-800">
                    {item.cantidad}
                  </span>
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.idProducto, 1)}
                    className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:bg-gray-100 rounded cursor-pointer"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm font-black text-gray-900">
                  Q {(Number(item.precioVentaProducto) * item.cantidad).toFixed(2)}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resumen Financiero */}
      <div className="pt-4 border-t border-gray-100 space-y-2 mt-3">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Subtotal</span>
          <span className="font-semibold text-gray-800">Q {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base font-black text-gray-900 pt-1">
          <span>Total a Pagar</span>
          <span className="text-xl text-[#1e3a8a]">Q {total.toFixed(2)}</span>
        </div>

        {/* Botones de acción */}
        <div className="grid grid-cols-2 gap-2 pt-3">
          <Button
            type="button"
            variant="outline"
            disabled={items.length === 0}
            onClick={onIniciarCotizacion}
            className="text-xs"
          >
            Guardar Cotización
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={items.length === 0}
            onClick={onIniciarCobro}
            className="text-xs font-black shadow-sm"
          >
            Cobrar Venta
          </Button>
        </div>
      </div>
    </div>
  );
};
