'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Factura } from '../../../lib/types';
import { Modal } from '../../ui/Modal';
import { Button } from '../../ui/Button';

export interface TicketImpresionProps {
  isOpen: boolean;
  onClose: () => void;
  factura: Factura | null;
}

// Código QR vectorial para sello fiscal electrónico SAT
const QrDteSat = ({ className = 'w-16 h-16' }: { className?: string }) => (
  <svg className={`${className} shrink-0 text-slate-800`} viewBox="0 0 100 100" fill="currentColor">
    {/* Patrones de esquina */}
    <rect x="5" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
    <rect x="13" y="13" width="12" height="12" fill="currentColor" />
    <rect x="67" y="5" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
    <rect x="75" y="13" width="12" height="12" fill="currentColor" />
    <rect x="5" y="67" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="6" rx="2" />
    <rect x="13" y="75" width="12" height="12" fill="currentColor" />
    {/* Módulos de datos simulados */}
    <rect x="42" y="8" width="6" height="6" />
    <rect x="52" y="12" width="6" height="6" />
    <rect x="42" y="24" width="6" height="6" />
    <rect x="52" y="28" width="6" height="6" />
    <rect x="12" y="42" width="6" height="6" />
    <rect x="24" y="48" width="6" height="6" />
    <rect x="42" y="42" width="6" height="6" />
    <rect x="52" y="48" width="6" height="6" />
    <rect x="48" y="62" width="6" height="6" />
    <rect x="64" y="42" width="6" height="6" />
    <rect x="76" y="48" width="6" height="6" />
    <rect x="88" y="42" width="6" height="6" />
    <rect x="68" y="64" width="6" height="6" />
    <rect x="80" y="72" width="6" height="6" />
    <rect x="68" y="84" width="6" height="6" />
    <rect x="88" y="84" width="6" height="6" />
    <rect x="42" y="78" width="6" height="6" />
    <rect x="52" y="86" width="6" height="6" />
  </svg>
);

export const TicketImpresion: React.FC<TicketImpresionProps> = ({
  isOpen,
  onClose,
  factura,
}) => {
  const [formato, setFormato] = useState<'CARTA' | 'TICKET'>('CARTA');

  if (!factura) return null;

  const handleImprimir = () => {
    window.print();
  };

  const fechaFormateada = new Date(factura.fechaFactura).toLocaleString('es-GT', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const totalNum = Number(factura.totalFactura) || 0;
  const ivaCalculado = (totalNum * 0.12) / 1.12;
  const subtotalSinIva = totalNum - ivaCalculado;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Comprobante Fiscal de Venta"
      description="Visualización y emisión física de la factura electrónica para el cliente."
      maxWidth="2xl"
    >
      <div className="space-y-4">
        {/* Selector de formato (No imprimible) */}
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 p-2 bg-slate-100 rounded-xl">
          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setFormato('CARTA')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                formato === 'CARTA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>📄</span>
              <span>Factura Estándar (Carta)</span>
            </button>
            <button
              type="button"
              onClick={() => setFormato('TICKET')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                formato === 'TICKET'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>🧾</span>
              <span>Ticket POS (80mm)</span>
            </button>
          </div>

          <span className="text-[11px] text-slate-500 hidden sm:inline">
            Listo para enviar a la impresora o guardar en PDF
          </span>
        </div>

        {/* CONTENEDOR PRINCIPAL IMPRIMIBLE */}
        <div className="factura-print-zone bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {formato === 'CARTA' ? (
            /* ========================================================= */
            /* FORMATO 1: FACTURA ESTÁNDAR / HOJA CARTA                  */
            /* ========================================================= */
            <div className="p-6 sm:p-8 space-y-6 text-slate-800 text-xs">
              {/* Encabezado Superior */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-5 border-b border-slate-200">
                <div className="flex items-start gap-3.5">
                  <div className="relative w-14 h-14 shrink-0 bg-slate-50 p-1 rounded-xl border border-slate-100">
                    <Image src="/PintaPro.png" alt="PintaPro" fill className="object-contain" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight">PINTAPRO S.A.</h2>
                    <p className="text-[11px] font-medium text-slate-500">Pinturas, Solventes y Recubrimientos Industriales</p>
                    <div className="mt-1 text-[11px] text-slate-600 space-y-0.5">
                      <p>NIT: <strong>9876543-2</strong> · PBX: <strong>+(502) 7761-0000</strong></p>
                      <p>4a Calle 12-45 Zona 3, Quetzaltenango, Guatemala</p>
                      <p className="text-slate-400">ventas@pintapro.com · www.pintapro.com</p>
                    </div>
                  </div>
                </div>

                <div className="w-full sm:w-auto min-w-[210px] p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 text-left sm:text-right space-y-1">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Factura Electrónica (DTE)
                  </span>
                  <div className="font-mono text-sm font-black text-slate-900">
                    {factura.numeroFactura}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Fecha: <strong className="text-slate-700">{fechaFormateada}</strong>
                  </div>
                  <div className="pt-1">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        factura.estadoFactura === 'Anulada'
                          ? 'bg-red-100 text-red-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {factura.estadoFactura === 'Anulada' ? 'ANULADA' : 'DOCUMENTO CERTIFICADO'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ficha del Cliente y Venta */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50/60 rounded-xl border border-slate-100">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Datos del Cliente / Receptor
                  </span>
                  <p className="font-bold text-slate-900 text-sm">
                    {factura.nombreCliente || 'Consumidor Final'}
                  </p>
                  <p className="text-slate-600">
                    NIT / DPI:{' '}
                    <span className="font-mono font-semibold text-slate-800">
                      {factura.nitCliente || 'CF'}
                    </span>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Dirección: {factura.direccionCliente || 'Ciudad de Guatemala'}
                  </p>
                </div>

                <div className="space-y-1 sm:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Información de la Operación
                  </span>
                  <p className="text-slate-700">
                    Atendido por: <strong className="text-slate-900">{factura.nombreEmpleado || 'Cajero en Turno'}</strong>
                  </p>
                  <p className="text-slate-600">
                    Moneda: <strong className="text-slate-900">Quetzales (GTQ - Q)</strong>
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Régimen: Sujeto a Retención Definitiva ISR
                  </p>
                </div>
              </div>

              {/* Tabla de Productos Facturados */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-200 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                      <th className="py-2.5 px-2 text-center w-8">#</th>
                      <th className="py-2.5 px-2 w-28">Código</th>
                      <th className="py-2.5 px-2">Descripción y Presentación</th>
                      <th className="py-2.5 px-2 text-center w-16">Cant.</th>
                      <th className="py-2.5 px-2 text-right w-24">P. Unitario</th>
                      <th className="py-2.5 px-2 text-right w-24">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(factura.detalles || []).map((d, index) => (
                      <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-2.5 px-2 text-center text-slate-400 font-mono text-[11px]">
                          {index + 1}
                        </td>
                        <td className="py-2.5 px-2 font-mono text-[11px] text-slate-600">
                          {d.codigoProducto || `PROD-${d.idProducto}`}
                        </td>
                        <td className="py-2.5 px-2">
                          <span className="font-semibold text-slate-900 block">{d.nombreProducto}</span>
                          {d.descripcionMedida && (
                            <span className="text-[10px] text-slate-400 block">
                              Presentación: {d.descripcionMedida}
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-slate-800">
                          {d.cantidadVendida}
                        </td>
                        <td className="py-2.5 px-2 text-right text-slate-600 font-mono">
                          Q {Number(d.precioVendido).toFixed(2)}
                        </td>
                        <td className="py-2.5 px-2 text-right font-black text-slate-900 font-mono">
                          Q {Number(d.subtotalVendido).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Bloque Inferior: Desglose de Pagos y Resumen Financiero */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
                {/* Columna Izquierda: Pagos y Sello Fiscal */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                      Formas de Pago Aplicadas
                    </span>
                    <div className="space-y-1.5">
                      {(factura.pagos || []).length > 0 ? (
                        factura.pagos?.map((p, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between items-center p-2 rounded-lg bg-slate-50 border border-slate-100 text-[11px]"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">
                                {p.idMedioPago === 1 ? '💵 Efectivo' : p.idMedioPago === 2 ? '💳 Tarjeta' : '🏦 Transferencia'}
                              </span>
                              {p.referenciaPago && p.referenciaPago !== 'EFECTIVO' && (
                                <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                                  {p.referenciaPago}
                                </span>
                              )}
                            </div>
                            <span className="font-mono font-bold text-slate-900">
                              Q {Number(p.montoPago).toFixed(2)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-slate-400 text-xs">Sin desglose de pago registrado</div>
                      )}
                    </div>
                  </div>

                  {/* Sello de Certificación DTE SAT */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <QrDteSat className="w-14 h-14" />
                    <div className="text-[10px] text-slate-500 leading-tight space-y-0.5">
                      <p className="font-bold text-slate-700">Autorización SAT No: 2026-DTE-8472910</p>
                      <p>Certificador: INFILE S.A. · NIT: 1257493-0</p>
                      <p className="text-slate-400">Documento emitido electrónicamente según Decreto 27-92 SAT.</p>
                    </div>
                  </div>
                </div>

                {/* Columna Derecha: Resumen de Totales */}
                <div className="space-y-2">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal (sin impuestos):</span>
                      <span className="font-mono">Q {subtotalSinIva.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>IVA (12% incluido):</span>
                      <span className="font-mono">Q {ivaCalculado.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Descuentos comerciales:</span>
                      <span className="font-mono">Q 0.00</span>
                    </div>

                    <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-900">
                        TOTAL A PAGAR:
                      </span>
                      <span className="text-2xl font-black text-[#1e3a8a] font-mono">
                        Q {totalNum.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-[10px] text-center text-slate-400 pt-1">
                    Total en letras: {totalNum.toFixed(2)} Quetzales Exactos
                  </p>
                </div>
              </div>

              {/* Mensaje de Cierre / Despedida */}
              <div className="pt-4 border-t border-dashed border-slate-200 text-center space-y-1">
                <p className="font-bold text-slate-700 text-xs">
                  ¡Gracias por su confianza en PintaPro!
                </p>
                <p className="text-[10px] text-slate-400">
                  Garantía de calidad en cada gota · Conserve esta factura para reclamos o cambios de producto dentro de los 30 días posteriores a la compra.
                </p>
              </div>
            </div>
          ) : (
            /* ========================================================= */
            /* FORMATO 2: TICKET TÉRMICO POS (80MM)                      */
            /* ========================================================= */
            <div className="p-6 max-w-[340px] mx-auto text-slate-900 font-mono text-[11px] space-y-3">
              {/* Encabezado Térmico */}
              <div className="text-center space-y-1 pb-3 border-b border-dashed border-slate-300">
                <div className="relative w-12 h-12 mx-auto">
                  <Image src="/PintaPro.png" alt="PintaPro" fill className="object-contain" />
                </div>
                <h3 className="font-black text-sm tracking-wider uppercase">PINTAPRO S.A.</h3>
                <p className="text-[10px] text-slate-500">Pinturas y Recubrimientos</p>
                <p className="text-[10px] text-slate-500">NIT: 9876543-2 · PBX: 7761-0000</p>
                <p className="text-[10px] text-slate-500">Quetzaltenango, Guatemala</p>
                <div className="mt-2 py-1 bg-slate-100 rounded text-xs font-black">
                  FACTURA No. {factura.numeroFactura}
                </div>
              </div>

              {/* Datos Venta */}
              <div className="space-y-0.5 text-[10px] pb-2 border-b border-dashed border-slate-300 text-slate-700">
                <div><b>FECHA:</b> {fechaFormateada}</div>
                <div><b>CLIENTE:</b> {factura.nombreCliente || 'Consumidor Final'}</div>
                <div><b>NIT:</b> {factura.nitCliente || 'CF'}</div>
                {factura.direccionCliente && <div><b>DIR:</b> {factura.direccionCliente}</div>}
                <div><b>CAJERO:</b> {factura.nombreEmpleado || 'Caja 1'}</div>
              </div>

              {/* Productos */}
              <div className="space-y-2 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between font-bold text-[9px] uppercase text-slate-400">
                  <span>Cant / Descripción</span>
                  <span>Subtotal</span>
                </div>
                {(factura.detalles || []).map((d, index) => (
                  <div key={index} className="space-y-0.5">
                    <div className="font-bold text-slate-900">
                      {d.cantidadVendida}x {d.nombreProducto}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>P.U: Q {Number(d.precioVendido).toFixed(2)}</span>
                      <span className="font-bold text-slate-900 font-mono">
                        Q {Number(d.subtotalVendido).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Térmico */}
              <div className="space-y-1.5 pb-3 border-b border-dashed border-slate-300">
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Subtotal:</span>
                  <span>Q {subtotalSinIva.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>IVA (12%):</span>
                  <span>Q {ivaCalculado.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-base font-black text-slate-900 pt-1">
                  <span>TOTAL:</span>
                  <span>Q {totalNum.toFixed(2)}</span>
                </div>
              </div>

              {/* Desglose de Pagos */}
              {(factura.pagos || []).length > 0 && (
                <div className="space-y-1 pb-3 border-b border-dashed border-slate-300 text-[10px]">
                  <b className="block text-slate-500 uppercase">Formas de Pago:</b>
                  {factura.pagos?.map((p, idx) => (
                    <div key={idx} className="flex justify-between items-center text-slate-700">
                      <span>
                        {p.nombreMedioPago || 'Pago'}
                        {p.referenciaPago && p.referenciaPago !== 'EFECTIVO' ? (
                          <span className="text-[9px] text-slate-400 block font-mono">
                            {p.referenciaPago}
                          </span>
                        ) : null}
                      </span>
                      <span className="font-bold">Q {Number(p.montoPago).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* QR Térmico */}
              <div className="pt-2 text-center space-y-2">
                <div className="flex justify-center">
                  <QrDteSat className="w-16 h-16" />
                </div>
                <p className="text-[9px] text-slate-400 leading-tight">
                  Autorización SAT No: 2026-DTE-8472910<br />
                  ¡Gracias por su preferencia!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Botones de acción del Modal (No imprimibles) */}
        <div className="no-print flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>

          <Button
            variant="primary"
            onClick={handleImprimir}
            icono={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
            }
          >
            Imprimir Comprobante
          </Button>
        </div>
      </div>
    </Modal>
  );
};
