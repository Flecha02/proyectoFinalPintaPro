'use client';

import React, { createContext, useContext, useState } from 'react';
import { Cotizacion, ItemCarrito, Producto } from '../lib/types';

interface CartContextType {
  items: ItemCarrito[];
  cotizacionOrigen: Cotizacion | null;
  agregarProducto: (producto: Producto) => void;
  cambiarCantidad: (idProducto: number, delta: number) => void;
  eliminarItem: (idProducto: number) => void;
  vaciarCarrito: () => void;
  cargarCotizacion: (cot: Cotizacion) => void;
  subtotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ItemCarrito[]>([]);
  const [cotizacionOrigen, setCotizacionOrigen] = useState<Cotizacion | null>(null);

  const agregarProducto = (prod: Producto) => {
    setItems((prev) => {
      const existe = prev.find((item) => item.idProducto === prod.idProducto);
      if (existe) {
        return prev.map((item) =>
          item.idProducto === prod.idProducto
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      }
      return [...prev, { ...prod, cantidad: 1 }];
    });
  };

  const cambiarCantidad = (idProducto: number, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.idProducto === idProducto) {
            const nuevaCant = item.cantidad + delta;
            return nuevaCant > 0 ? { ...item, cantidad: nuevaCant } : null;
          }
          return item;
        })
        .filter(Boolean) as ItemCarrito[]
    );
  };

  const eliminarItem = (idProducto: number) => {
    setItems((prev) => prev.filter((item) => item.idProducto !== idProducto));
  };

  const vaciarCarrito = () => {
    setItems([]);
    setCotizacionOrigen(null);
  };

  const cargarCotizacion = (cot: Cotizacion) => {
    setCotizacionOrigen(cot);
    if (cot.detalles && cot.detalles.length > 0) {
      setItems(
        cot.detalles.map((d) => ({
          idProducto: d.idProducto,
          codigoProducto: d.codigoProducto || `P-${d.idProducto}`,
          nombreProducto: d.nombreProducto || 'Producto',
          nombreCategoria: 'Cotizado',
          marcaProducto: 'PintaPro',
          colorProducto: 'N/A',
          descripcionMedida: d.descripcionMedida || 'Unidad',
          precioVentaProducto: Number(d.precioCotizado),
          cantidad: Number(d.cantidadCotizada),
        }))
      );
    }
  };

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.precioVentaProducto) * item.cantidad,
    0
  );
  const total = subtotal;

  return (
    <CartContext.Provider
      value={{
        items,
        cotizacionOrigen,
        agregarProducto,
        cambiarCantidad,
        eliminarItem,
        vaciarCarrito,
        cargarCotizacion,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextType {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser utilizado dentro de un CartProvider');
  }
  return context;
}
