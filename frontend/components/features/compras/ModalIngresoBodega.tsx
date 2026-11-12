'use client';

import React, { useEffect, useState } from 'react';
import { DetalleOrdenCompra, OrdenCompra, UbicacionBodega } from '../../../lib/types';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

export interface LineaRecepcion extends DetalleOrdenCompra {
  codigoLote: string;
  cantidadRecibida: number;
  costoUnitario: number;
  idUbicacionBodega: number;
}

export interface ModalIngresoBodegaProps {
  isOpen: boolean;
  onClose: () => void;
  orden: OrdenCompra | null;
  ubicaciones: UbicacionBodega[];
  onConfirmarIngreso: (datos: {
    idOrdenCompra: number;
    numeroDocumentoEntrega?: string;
    lotesIngreso: Array<{
      idProducto: number;
      idUbicacionBodega: number;
      codigoLote: string;
      cantidadRecibida: number;
      costoUnitario: number;
    }>;
  }) => Promise<void>;
}

export const ModalIngresoBodega: React.FC<ModalIngresoBodegaProps> = ({
  isOpen,
  onClose,
  orden,
  ubicaciones,
  onConfirmarIngreso,
}) => {
  const [lineas, setLineas] = useState<LineaRecepcion[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orden && orden.detalles) {
      setLineas(
        orden.detalles.map((d) => {
          const pendiente =
            d.cantidadPendiente !== undefined
              ? d.cantidadPendiente
              : Math.max(0, Number(d.cantidadSolicitada) - Number(d.cantidadYaRecibida || 0));
          return {
            ...d,
            codigoLote: `LOT-${d.idProducto}-${Date.now().toString().slice(-4)}`,
            cantidadRecibida: pendiente,
            costoUnitario: Number(d.precioAcordado),
            idUbicacionBodega: ubicaciones[0]?.idUbicacionBodega || 1,
          };
        })
      );
    }
    setError('');
  }, [orden, ubicaciones, isOpen]);

  const handleUpdateLinea = (index: number, patch: Partial<LineaRecepcion>) => {
    setLineas(lineas.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orden) return;

    // Filtrar líneas donde se va a recibir cantidad > 0 en este envío
    const lotesValidos = lineas.filter((l) => Number(l.cantidadRecibida) > 0);

    if (lotesValidos.length === 0) {
      setError('Debes indicar al menos un producto con cantidad a recibir mayor a 0 para esta entrega.');
      return;
    }

    for (const linea of lotesValidos) {
      const cant = Number(linea.cantidadRecibida);
      if (!Number.isInteger(cant) || cant <= 0) {
        setError(`La cantidad a recibir de "${linea.nombreProducto}" debe ser un número entero mayor a 0.`);
        return;
      }
      const pendiente =
        linea.cantidadPendiente !== undefined
          ? linea.cantidadPendiente
          : Math.max(0, Number(linea.cantidadSolicitada) - Number(linea.cantidadYaRecibida || 0));
      if (cant > pendiente) {
        setError(`La cantidad de "${linea.nombreProducto}" (${cant}) supera lo pendiente por recibir (${pendiente}).`);
        return;
      }
      if (!linea.codigoLote.trim()) {
        setError(`Debes ingresar el código de lote para "${linea.nombreProducto}".`);
        return;
      }
      if (!linea.idUbicacionBodega) {
        setError(`Debes seleccionar la ubicación en bodega para "${linea.nombreProducto}".`);
        return;
      }
    }

    setCargando(true);
    setError('');
    try {
      await onConfirmarIngreso({
        idOrdenCompra: orden.idOrdenCompra,
        lotesIngreso: lotesValidos.map((l) => ({
          idProducto: l.idProducto,
          idUbicacionBodega: Number(l.idUbicacionBodega),
          codigoLote: l.codigoLote.trim(),
          cantidadRecibida: Number(l.cantidadRecibida),
          costoUnitario: Number(l.costoUnitario),
        })),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el ingreso a bodega');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Ingreso a Bodega · Orden #${orden?.idOrdenCompra || ''}`}
      description="Registra los lotes físicos recibidos. Puedes recibir entregas parciales y completar el resto en días posteriores."
      maxWidth="4xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
            {error}
          </div>
        )}

        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">
              Detalle de productos por recibir
            </h3>
            <span className="text-xs text-gray-400">
              Ingresa únicamente números enteros
            </span>
          </div>

          {lineas.map((linea, index) => {
            const pendiente =
              linea.cantidadPendiente !== undefined
                ? linea.cantidadPendiente
                : Math.max(0, Number(linea.cantidadSolicitada) - Number(linea.cantidadYaRecibida || 0));
            const yaRecibido = Number(linea.cantidadYaRecibida || 0);
            const completado = pendiente <= 0;

            return (
              <div
                key={linea.idProducto}
                className={`p-3.5 rounded-xl border transition-all ${
                  completado
                    ? 'border-gray-200 bg-gray-100/60 opacity-75'
                    : 'border-gray-200 bg-gray-50/70 hover:border-blue-200'
                } grid grid-cols-1 md:grid-cols-4 gap-3 text-xs`}
              >
                <div className="md:col-span-1 flex flex-col justify-center space-y-1">
                  <span className="font-bold text-gray-900 text-sm leading-tight">
                    {linea.nombreProducto}
                  </span>
                  <div className="flex flex-wrap gap-1 text-[11px]">
                    <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 font-medium">
                      Solicitado: {linea.cantidadSolicitada} un.
                    </span>
                    {yaRecibido > 0 && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-medium">
                        Recibido previo: {yaRecibido} un.
                      </span>
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-md font-bold ${
                        completado
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-amber-100 text-amber-900'
                      }`}
                    >
                      {completado ? 'Completado (0 pend.)' : `Pendiente: ${pendiente} un.`}
                    </span>
                  </div>
                </div>

                <div>
                  <Input
                    label="Código de Lote"
                    required={!completado && Number(linea.cantidadRecibida) > 0}
                    disabled={completado}
                    value={linea.codigoLote}
                    onChange={(e) => handleUpdateLinea(index, { codigoLote: e.target.value })}
                  />
                </div>

                <div>
                  <Input
                    label="Cantidad a Recibir (Entero)"
                    required={!completado}
                    disabled={completado}
                    type="number"
                    step="1"
                    min="0"
                    max={pendiente}
                    value={linea.cantidadRecibida}
                    onChange={(e) => {
                      const cleanVal = e.target.value.replace(/[^0-9]/g, '');
                      const numVal = cleanVal === '' ? 0 : Number(cleanVal);
                      handleUpdateLinea(index, { cantidadRecibida: Math.min(numVal, pendiente) });
                    }}
                  />
                  {!completado && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px]">
                      <button
                        type="button"
                        onClick={() => handleUpdateLinea(index, { cantidadRecibida: pendiente })}
                        className="text-blue-600 hover:text-blue-800 underline font-medium cursor-pointer"
                      >
                        Recibir todo ({pendiente})
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        type="button"
                        onClick={() => handleUpdateLinea(index, { cantidadRecibida: 0 })}
                        className="text-gray-500 hover:text-gray-700 underline font-medium cursor-pointer"
                      >
                        No recibido (0)
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <Select
                    label="Ubicación en Bodega"
                    required={!completado && Number(linea.cantidadRecibida) > 0}
                    disabled={completado}
                    value={linea.idUbicacionBodega}
                    onChange={(e) => handleUpdateLinea(index, { idUbicacionBodega: Number(e.target.value) })}
                    options={ubicaciones.map((u) => ({
                      value: u.idUbicacionBodega,
                      label: `${u.estanteUbicacion} · ${u.pasilloUbicacion}`,
                    }))}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="success" cargando={cargando}>
            Confirmar Ingreso e Inventariar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
