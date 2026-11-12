'use client';

import React, { useState } from 'react';
import { Producto, Proveedor } from '../../../lib/types';
import { Select } from '../../ui/Select';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';

export interface LineaCompra {
  idProducto: number;
  nombreProducto: string;
  cantidadSolicitada: number;
  precioAcordado: number;
}

export interface OrdenCompraFormProps {
  proveedores: Proveedor[];
  productos: Producto[];
  onCrearOrden: (orden: {
    idProveedor: number;
    detalles: Array<{
      idProducto: number;
      cantidadSolicitada: number;
      precioAcordado: number;
    }>;
  }) => Promise<void>;
}

export const OrdenCompraForm: React.FC<OrdenCompraFormProps> = ({
  proveedores,
  productos,
  onCrearOrden,
}) => {
  const [proveedorId, setProveedorId] = useState<number | ''>('');
  const [productoId, setProductoId] = useState<number | ''>('');
  const [cantidad, setCantidad] = useState('');
  const [precio, setPrecio] = useState('');
  const [lineas, setLineas] = useState<LineaCompra[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  const handleAgregarLinea = () => {
    const cantNum = Number(cantidad);
    if (!productoId || !Number.isInteger(cantNum) || cantNum <= 0 || Number(precio) < 0) {
      setError('Debes seleccionar un producto e indicar una cantidad entera positiva (mayor a 0) y precio válido.');
      return;
    }
    const prod = productos.find((p) => p.idProducto === Number(productoId));
    if (!prod) return;

    setLineas([
      ...lineas,
      {
        idProducto: prod.idProducto,
        nombreProducto: prod.nombreProducto,
        cantidadSolicitada: cantNum,
        precioAcordado: Number(precio),
      },
    ]);
    setProductoId('');
    setCantidad('');
    setPrecio('');
    setError('');
  };

  const handleQuitarLinea = (index: number) => {
    setLineas(lineas.filter((_, i) => i !== index));
  };

  const totalOrden = lineas.reduce(
    (acc, item) => acc + item.cantidadSolicitada * item.precioAcordado,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedorId) {
      setError('Selecciona un proveedor para la orden.');
      return;
    }
    if (lineas.length === 0) {
      setError('Agrega al menos un producto a la orden de compra.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      await onCrearOrden({
        idProveedor: Number(proveedorId),
        detalles: lineas.map((l) => ({
          idProducto: l.idProducto,
          cantidadSolicitada: l.cantidadSolicitada,
          precioAcordado: l.precioAcordado,
        })),
      });
      setLineas([]);
      setProveedorId('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la orden de compra');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col h-full">
      <div className="pb-4 border-b border-gray-100 mb-4">
        <h2 className="text-lg font-bold text-gray-900">Nueva Orden de Compra</h2>
        <p className="text-xs text-gray-400">Solicitud formal de productos y precios con proveedores</p>
      </div>

      {error && (
        <div className="p-3 mb-4 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
          {error}
        </div>
      )}

      <div className="mb-4">
        <Select
          label="Proveedor destino"
          required
          value={proveedorId}
          onChange={(e) => setProveedorId(Number(e.target.value))}
          placeholder="Selecciona un proveedor..."
          options={proveedores.map((p) => ({
            value: p.idProveedor,
            label: `${p.nombreProveedor} (NIT: ${p.nitProveedor})`,
          }))}
        />
      </div>

      <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 space-y-3 mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Agregar producto a la orden
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-1">
            <Select
              label="Producto"
              value={productoId}
              onChange={(e) => {
                const val = Number(e.target.value);
                setProductoId(val);
                const prod = productos.find((p) => p.idProducto === val);
                if (prod && !precio) {
                  setPrecio(String(prod.precioVentaProducto));
                }
              }}
              placeholder="Elegir..."
              options={productos.map((p) => ({
                value: p.idProducto,
                label: `${p.codigoProducto} - ${p.nombreProducto}`,
              }))}
            />
          </div>
          <div>
            <Input
              label="Cantidad (Entero)"
              type="number"
              min="1"
              step="1"
              placeholder="ej. 50"
              value={cantidad}
              onChange={(e) => {
                const val = e.target.value.replace(/[^0-9]/g, '');
                setCantidad(val);
              }}
            />
          </div>
          <div>
            <Input
              label="Precio Acordado (Q)"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleAgregarLinea}
          className="w-full bg-white hover:bg-gray-100"
        >
          + Agregar a la lista
        </Button>
      </div>

      {/* Lista de productos agregados */}
      <div className="flex-1 overflow-y-auto max-h-52 space-y-2 mb-4">
        {lineas.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-4">No has añadido productos a esta orden.</p>
        ) : (
          lineas.map((l, index) => (
            <div
              key={`${l.idProducto}-${index}`}
              className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-white text-xs"
            >
              <div>
                <span className="font-bold text-gray-900">{l.nombreProducto}</span>
                <div className="text-gray-500">
                  {l.cantidadSolicitada} un. × Q {l.precioAcordado.toFixed(2)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-bold text-gray-900">
                  Q {(l.cantidadSolicitada * l.precioAcordado).toFixed(2)}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuitarLinea(index)}
                  className="text-red-500 hover:text-red-700 font-bold p-1 cursor-pointer"
                  aria-label="Quitar producto"
                >
                  ✕
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pie con Total y Botón de envío */}
      <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
        <div>
          <span className="text-xs text-gray-500">Total estimado:</span>
          <div className="text-lg font-black text-[#1e3a8a]">
            Q {totalOrden.toFixed(2)}
          </div>
        </div>
        <Button
          type="submit"
          variant="primary"
          cargando={cargando}
          disabled={lineas.length === 0 || !proveedorId}
        >
          Crear Orden de Compra
        </Button>
      </div>
    </form>
  );
};
