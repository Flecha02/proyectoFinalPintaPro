'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useToast } from '../../../context/ToastContext';
import { Card } from '../../ui/Card';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Modal } from '../../ui/Modal';
import { Alert } from '../../ui/Alert';
import {
  FacturaResumenApi,
  anularFacturaPorNumero,
  listarFacturas,
  obtenerFacturaParaImpresion,
} from '../../../lib/api';

export const AnularFacturaSection: React.FC = () => {
  const { user } = useAuth();
  const { mostrarExito, mostrarError } = useToast();

  const [facturas, setFacturas] = useState<FacturaResumenApi[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'TODAS' | 'EMITIDAS' | 'ANULADAS'>('TODAS');
  const [cargando, setCargando] = useState(true);

  // Modales
  const [facturaSeleccionada, setFacturaSeleccionada] = useState<any | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [facturaParaAnular, setFacturaParaAnular] = useState<FacturaResumenApi | null>(null);
  const [anulando, setAnulando] = useState(false);

  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarFacturas = async (criterio = '') => {
    setCargando(true);
    try {
      const resp = await listarFacturas(criterio);
      if (resp?.data) {
        setFacturas(resp.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al cargar las facturas.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarFacturas(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleVerDetalle = async (idOFactura: number | string) => {
    setCargandoDetalle(true);
    try {
      const resp = await obtenerFacturaParaImpresion(idOFactura);
      if (resp?.data) {
        setFacturaSeleccionada(resp.data);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al obtener el detalle de la factura.';
      mostrarError(msg);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const handleConfirmarAnulacion = async () => {
    if (!facturaParaAnular || !user?.idUsuario) return;

    setAnulando(true);
    try {
      await anularFacturaPorNumero(facturaParaAnular.numeroFactura, user.idUsuario);
      const msg = `Factura ${facturaParaAnular.numeroFactura} anulada exitosamente y productos restituidos al inventario.`;
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Factura Anulada');

      setFacturaParaAnular(null);
      if (facturaSeleccionada?.factura?.numeroFactura === facturaParaAnular.numeroFactura) {
        setFacturaSeleccionada((prev: any) => ({
          ...prev,
          factura: { ...prev.factura, estadoFactura: 'Anulada' },
        }));
      }

      // Recargar listado
      cargarFacturas(busqueda);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al anular la factura.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Fallo al Anular');
    } finally {
      setAnulando(false);
    }
  };

  const facturasFiltradas = facturas.filter((f) => {
    if (filtroEstado === 'EMITIDAS') return f.estadoFactura === 'Emitida';
    if (filtroEstado === 'ANULADAS') return f.estadoFactura === 'Anulada';
    return true;
  });

  return (
    <div className="space-y-6">
      {alerta && (
        <Alert
          tipo={alerta.tipo}
          mensaje={alerta.mensaje}
          onDismiss={() => setAlerta(null)}
        />
      )}

      {/* Barra de Filtros y Búsqueda */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por # Factura, Cliente o NIT..."
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              }
              rightIcon={
                busqueda ? (
                  <button
                    onClick={() => setBusqueda('')}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                ) : undefined
              }
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFiltroEstado('TODAS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'TODAS'
                    ? 'bg-white text-gray-900 shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Todas ({facturas.length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('EMITIDAS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'EMITIDAS'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Emitidas ({facturas.filter((f) => f.estadoFactura === 'Emitida').length})
              </button>
              <button
                type="button"
                onClick={() => setFiltroEstado('ANULADAS')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  filtroEstado === 'ANULADAS'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Anuladas ({facturas.filter((f) => f.estadoFactura === 'Anulada').length})
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Tabla de Facturas */}
      <Card className="overflow-hidden">
        {cargando ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando registro de ventas y facturas...</p>
          </div>
        ) : facturasFiltradas.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">No se encontraron facturas</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {busqueda
                ? `No hay facturas que coincidan con "${busqueda}".`
                : 'No se registran facturas en este estado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5"># Factura</th>
                  <th className="px-6 py-3.5">Fecha y Hora</th>
                  <th className="px-6 py-3.5">Cliente</th>
                  <th className="px-6 py-3.5">Atendido Por</th>
                  <th className="px-6 py-3.5 text-right">Total Factura</th>
                  <th className="px-6 py-3.5 text-center">Estado</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {facturasFiltradas.map((f) => {
                  const esAnulada = f.estadoFactura === 'Anulada';
                  const fechaFormateada = new Date(f.fechaFactura).toLocaleString('es-GT', {
                    dateStyle: 'short',
                    timeStyle: 'short',
                  });

                  return (
                    <tr
                      key={f.idFactura}
                      className={`hover:bg-gray-50/60 transition-colors ${
                        esAnulada ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap font-mono font-bold text-gray-900">
                        {f.numeroFactura}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 text-xs">
                        {fechaFormateada}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">{f.nombreCliente}</div>
                        <div className="text-xs text-gray-400">NIT: {f.nitCliente || 'CF'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-600">
                        {f.nombreEmpleado}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right font-black text-gray-900">
                        Q {Number(f.totalFactura).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {esAnulada ? (
                          <Badge variant="danger">Anulada</Badge>
                        ) : (
                          <Badge variant="success">Emitida</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleVerDetalle(f.idFactura)}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Ver detalle y productos de la factura"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>

                          {!esAnulada && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => setFacturaParaAnular(f)}
                              icono={
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              }
                            >
                              Anular
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modal de Detalle de Factura */}
      <Modal
        isOpen={!!facturaSeleccionada}
        onClose={() => setFacturaSeleccionada(null)}
        title={`Detalle de Factura: ${facturaSeleccionada?.factura?.numeroFactura || ''}`}
        description="Listado de productos facturados, cliente y medios de pago aplicados."
        maxWidth="2xl"
      >
        {facturaSeleccionada && (
          <div className="space-y-5">
            {/* Cabecera resumen */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-gray-50 rounded-2xl text-xs">
              <div>
                <span className="text-gray-400 block font-medium">Cliente</span>
                <span className="font-bold text-gray-900">{facturaSeleccionada.factura.nombreCliente}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">NIT / DPI</span>
                <span className="font-bold text-gray-900">{facturaSeleccionada.factura.nitCliente || 'CF'}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Estado</span>
                <Badge
                  variant={facturaSeleccionada.factura.estadoFactura === 'Anulada' ? 'danger' : 'success'}
                  size="sm"
                >
                  {facturaSeleccionada.factura.estadoFactura}
                </Badge>
              </div>
              <div>
                <span className="text-gray-400 block font-medium">Total Factura</span>
                <span className="font-black text-gray-900 text-sm">
                  Q {Number(facturaSeleccionada.factura.totalFactura).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Tabla de Productos Facturados */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Productos Facturados (Líneas de Venta)
              </h4>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-100/75 text-gray-600 font-semibold border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-2.5">Código</th>
                      <th className="px-4 py-2.5">Producto</th>
                      <th className="px-4 py-2.5">Presentación</th>
                      <th className="px-4 py-2.5 text-center">Cantidad</th>
                      <th className="px-4 py-2.5 text-right">Precio Unit.</th>
                      <th className="px-4 py-2.5 text-right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {facturaSeleccionada.detalles?.map((d: any) => (
                      <tr key={d.idDetalleFactura} className="hover:bg-gray-50/50">
                        <td className="px-4 py-2.5 font-mono text-blue-900 font-bold">{d.codigoProducto}</td>
                        <td className="px-4 py-2.5 font-medium text-gray-900">{d.nombreProducto}</td>
                        <td className="px-4 py-2.5 text-gray-500">{d.descripcionMedida}</td>
                        <td className="px-4 py-2.5 text-center font-bold text-gray-900">{Number(d.cantidadVendida)}</td>
                        <td className="px-4 py-2.5 text-right text-gray-600">Q {Number(d.precioVendido).toFixed(2)}</td>
                        <td className="px-4 py-2.5 text-right font-black text-gray-900">Q {Number(d.subtotalVendido).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Desglose de pagos */}
            <div>
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Medio de Pago Registrado
              </h4>
              <div className="flex flex-wrap gap-2">
                {facturaSeleccionada.pagos?.map((p: any) => (
                  <div
                    key={p.idPagoFactura}
                    className="p-2.5 rounded-xl border border-gray-200 bg-white text-xs flex items-center gap-3"
                  >
                    <span className="font-semibold text-gray-800">{p.nombreMedioPago}:</span>
                    <span className="font-black text-emerald-700">Q {Number(p.montoPago).toFixed(2)}</span>
                    {p.referenciaPago && (
                      <span className="text-gray-400 font-mono text-[11px]">({p.referenciaPago})</span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Acciones del Modal */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div>
                {facturaSeleccionada.factura.estadoFactura === 'Emitida' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      const f = facturas.find(
                        (item) => item.idFactura === facturaSeleccionada.factura.idFactura
                      ) || {
                        idFactura: facturaSeleccionada.factura.idFactura,
                        numeroFactura: facturaSeleccionada.factura.numeroFactura,
                        nombreCliente: facturaSeleccionada.factura.nombreCliente,
                        totalFactura: facturaSeleccionada.factura.totalFactura,
                      };
                      setFacturaParaAnular(f as FacturaResumenApi);
                    }}
                  >
                    Anular esta Factura y Retornar Productos
                  </Button>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => setFacturaSeleccionada(null)}>
                Cerrar Detalle
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Confirmación de Anulación */}
      <Modal
        isOpen={!!facturaParaAnular}
        onClose={() => setFacturaParaAnular(null)}
        title="Confirmar Anulación de Factura"
        maxWidth="md"
      >
        {facturaParaAnular && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200/60 flex items-start gap-3">
              <div className="text-amber-600 mt-0.5 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="text-xs text-amber-900 leading-relaxed">
                <p className="font-bold text-sm text-amber-950 mb-1">
                  Atención: Restitución de Inventario
                </p>
                Al anular la factura <strong className="font-mono">{facturaParaAnular.numeroFactura}</strong>, el sistema revertirá automáticamente la salida de lotes y <strong>devolverá todos los productos facturados al inventario y a su ubicación de bodega</strong>.
              </div>
            </div>

            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-gray-500">Cliente:</span>
                <span className="font-bold text-gray-900">{facturaParaAnular.nombreCliente}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Monto Total:</span>
                <span className="font-black text-gray-900 text-sm">
                  Q {Number(facturaParaAnular.totalFactura).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFacturaParaAnular(null)}
                disabled={anulando}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                size="sm"
                cargando={anulando}
                onClick={handleConfirmarAnulacion}
              >
                Sí, Anular y Retornar Productos
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
