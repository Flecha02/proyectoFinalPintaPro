'use client';

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Alert } from '../../ui/Alert';
import { Factura } from '../../../lib/types';
import { anularFacturaPorNumero, obtenerFacturaParaImpresion } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export const ReporteBuscarFactura: React.FC = () => {
  const { mostrarExito, mostrarError } = useToast();
  const { user } = useAuth();
  const [criterio, setCriterio] = useState('');
  const [factura, setFactura] = useState<Factura | null>(null);
  const [buscando, setBuscando] = useState(false);
  const [anulando, setAnulando] = useState(false);
  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const handleBuscar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!criterio.trim()) return;

    setBuscando(true);
    setAlerta(null);
    setFactura(null);

    try {
      const resp = await obtenerFacturaParaImpresion(criterio.trim());
      if (resp?.data?.factura) {
        setFactura({
          ...resp.data.factura,
          detalles: resp.data.detalles,
          pagos: resp.data.pagos,
        } as unknown as Factura);
      } else {
        const msg = 'No se encontró ninguna factura con ese identificador.';
        setAlerta({ tipo: 'error', mensaje: msg });
        mostrarError(msg);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al buscar factura';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg);
    } finally {
      setBuscando(false);
    }
  };

  const handleAnular = async () => {
    if (!factura || !user?.idUsuario) return;
    if (!window.confirm(`¿Seguro que deseas anular la factura ${factura.numeroFactura}?`)) {
      return;
    }

    setAnulando(true);
    setAlerta(null);

    try {
      await anularFacturaPorNumero(factura.numeroFactura, user.idUsuario);
      const msg = `La factura ${factura.numeroFactura} ha sido anulada con éxito en el sistema.`;
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Factura Anulada');
      // Actualizar estado local
      setFactura({
        ...factura,
        estadoFactura: 'Anulada',
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al anular factura';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Error al Anular');
    } finally {
      setAnulando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Buscador de Factura */}
      <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <h3 className="font-bold text-base text-gray-900 mb-1">
          Búsqueda y Auditoría de Factura
        </h3>
        <p className="text-xs text-gray-400 mb-4">
          Ingresa el número de factura o su ID numérico para visualizar el desglose de productos y pagos
        </p>

        {alerta && (
          <div className="mb-4">
            <Alert tipo={alerta.tipo} mensaje={alerta.mensaje} onDismiss={() => setAlerta(null)} />
          </div>
        )}

        <form onSubmit={handleBuscar} className="flex gap-2.5 max-w-lg">
          <div className="flex-1">
            <Input
              placeholder="ej. FAC-2026-001 o ID 1"
              required
              value={criterio}
              onChange={(e) => setCriterio(e.target.value)}
            />
          </div>
          <Button type="submit" variant="primary" cargando={buscando}>
            Consultar
          </Button>
        </form>
      </div>

      {/* Visualización de la Factura Encontrada */}
      {factura && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-3">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-xl font-black text-gray-900">
                  Factura #{factura.numeroFactura}
                </span>
                <Badge
                  variant={factura.estadoFactura === 'Anulada' ? 'danger' : 'success'}
                  size="md"
                >
                  {factura.estadoFactura}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Emitida el {String(factura.fechaFactura).slice(0, 19).replace('T', ' ')}
              </p>
            </div>

            {factura.estadoFactura !== 'Anulada' && (
              <Button
                variant="danger"
                size="sm"
                cargando={anulando}
                onClick={handleAnular}
              >
                Anular Factura
              </Button>
            )}
          </div>

          {/* Datos del Cliente y Empleado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block">Cliente:</span>
              <span className="font-bold text-gray-900 text-sm">{factura.nombreCliente}</span>
            </div>
            <div>
              <span className="text-gray-400 block">NIT:</span>
              <span className="font-bold text-gray-900">{factura.nitCliente || 'CF'}</span>
            </div>
            <div>
              <span className="text-gray-400 block">Cajero / Empleado:</span>
              <span className="font-bold text-gray-900">{factura.nombreEmpleado || 'N/A'}</span>
            </div>
          </div>

          {/* Tabla de Productos Vendidos */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-600 mb-2">
              Productos Facturados
            </h4>
            <div className="overflow-x-auto border border-gray-100 rounded-xl">
              <table className="w-full text-left text-xs text-gray-600">
                <thead className="bg-gray-50 font-bold text-gray-500 border-b border-gray-100 uppercase">
                  <tr>
                    <th className="px-4 py-2.5">Producto</th>
                    <th className="px-4 py-2.5 text-center">Cantidad</th>
                    <th className="px-4 py-2.5 text-right">Precio Unitario</th>
                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(factura.detalles || []).map((d, i) => (
                    <tr key={i}>
                      <td className="px-4 py-3 font-semibold text-gray-900">
                        {d.nombreProducto}
                      </td>
                      <td className="px-4 py-3 text-center">{d.cantidadVendida}</td>
                      <td className="px-4 py-3 text-right">Q {Number(d.precioVendido).toFixed(2)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">
                        Q {Number(d.subtotalVendido).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Desglose de Pagos y Gran Total */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 space-y-1">
              <span className="font-bold text-gray-700 block">Formas de Pago Aplicadas:</span>
              {(factura.pagos || []).map((p, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span>· {p.nombreMedioPago || 'Pago'}:</span>
                  <span className="font-semibold text-gray-800">Q {Number(p.montoPago).toFixed(2)}</span>
                  {p.referenciaPago && <span className="text-gray-400">({p.referenciaPago})</span>}
                </div>
              ))}
            </div>

            <div className="text-right sm:text-right">
              <span className="text-xs text-gray-400 block">Total de la Factura:</span>
              <span className="text-2xl font-black text-[#1e3a8a]">
                Q {Number(factura.totalFactura).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
