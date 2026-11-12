'use client';

import React, { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Factura } from '../../../lib/types';
import { buscarClientes, emitirFactura, obtenerFacturaParaImpresion, registrarCliente } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export interface ModalCobroProps {
  isOpen: boolean;
  onClose: () => void;
  onFacturaEmitida: (factura: Factura) => void;
}

export interface LineaPago {
  id: string;
  idMedioPago: number; // 1: Efectivo, 2: Tarjeta, 3: Transferencia
  monto: string;
  montoRecibido?: string;
  numeroTarjeta?: string;
  referencia?: string;
}

const METODOS_PAGO = [
  { id: 1, label: 'Efectivo', icon: '💵' },
  { id: 2, label: 'Tarjeta', icon: '💳' },
  { id: 3, label: 'Transferencia', icon: '🏦' },
];

export const ModalCobro: React.FC<ModalCobroProps> = ({
  isOpen,
  onClose,
  onFacturaEmitida,
}) => {
  const { mostrarExito, mostrarError } = useToast();
  const { items, total, cotizacionOrigen, vaciarCarrito } = useCart();
  const { user } = useAuth();

  const [tipoCliente, setTipoCliente] = useState<'CF' | 'NIT'>('CF');
  const [nit, setNit] = useState('');
  const [nombre, setNombre] = useState('Consumidor Final');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('Ciudad');
  const [idCliente, setIdCliente] = useState<number | null>(5); // CF tiene idCliente=5 por defecto en el dump

  // Modalidad de pago: UNICO vs MIXTO (2 o más métodos)
  const [modoPago, setModoPago] = useState<'UNICO' | 'MIXTO'>('UNICO');

  // Modo Pago Único
  const [metodoPago, setMetodoPago] = useState<number>(1); // 1: Efectivo, 2: Tarjeta, 3: Transferencia/Cheque
  const [montoEfectivo, setMontoEfectivo] = useState('');
  const [numeroTarjeta, setNumeroTarjeta] = useState('');
  const [referenciaPago, setReferenciaPago] = useState('');

  // Modo Pago Mixto
  const [lineasPago, setLineasPago] = useState<LineaPago[]>([
    { id: '1', idMedioPago: 1, monto: '', montoRecibido: '', numeroTarjeta: '', referencia: '' },
    { id: '2', idMedioPago: 2, monto: '', montoRecibido: '', numeroTarjeta: '', referencia: '' },
  ]);

  const [buscando, setBuscando] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (cotizacionOrigen) {
        setIdCliente(cotizacionOrigen.idCliente);
        setNombre(cotizacionOrigen.nombreCliente || 'Consumidor Final');
        setNit(cotizacionOrigen.nitCliente || 'CF');
        setTipoCliente(
          cotizacionOrigen.nitCliente && cotizacionOrigen.nitCliente.toUpperCase() !== 'CF'
            ? 'NIT'
            : 'CF'
        );
      } else {
        setTipoCliente('CF');
        setNit('');
        setNombre('Consumidor Final');
        setDireccion('Ciudad');
        setIdCliente(5);
      }
      setModoPago('UNICO');
      setMetodoPago(1);
      setMontoEfectivo('');
      setNumeroTarjeta('');
      setReferenciaPago('');
      setLineasPago([
        { id: '1', idMedioPago: 1, monto: '', montoRecibido: '', numeroTarjeta: '', referencia: '' },
        { id: '2', idMedioPago: 2, monto: '', montoRecibido: '', numeroTarjeta: '', referencia: '' },
      ]);
      setError('');
    }
  }, [isOpen, cotizacionOrigen]);

  // Cálculos Pago Único
  const cambioEfectivo =
    metodoPago === 1 && Number(montoEfectivo) >= total
      ? Number(montoEfectivo) - total
      : 0;

  // Cálculos Pago Mixto
  const totalDistribuidoMixto = lineasPago.reduce(
    (acc, l) => acc + (parseFloat(l.monto) || 0),
    0
  );
  const saldoRestanteMixto = Number((total - totalDistribuidoMixto).toFixed(2));
  const estaCuadradoMixto = Math.abs(saldoRestanteMixto) <= 0.01;

  const cambioTotalMixto = lineasPago.reduce((acc, l) => {
    if (l.idMedioPago === 1 && l.montoRecibido) {
      const entregado = parseFloat(l.montoRecibido);
      const monto = parseFloat(l.monto);
      if (!isNaN(entregado) && !isNaN(monto) && entregado > monto) {
        return acc + (entregado - monto);
      }
    }
    return acc;
  }, 0);

  const agregarLineaPago = () => {
    const nuevoId = String(Date.now() + Math.random());
    const usados = lineasPago.map((l) => l.idMedioPago);
    const sugerido = [1, 2, 3].find((m) => !usados.includes(m)) || 1;
    setLineasPago((prev) => [
      ...prev,
      { id: nuevoId, idMedioPago: sugerido, monto: '', montoRecibido: '', numeroTarjeta: '', referencia: '' },
    ]);
  };

  const eliminarLineaPago = (id: string) => {
    if (lineasPago.length <= 2) return;
    setLineasPago((prev) => prev.filter((l) => l.id !== id));
  };

  const actualizarLineaPago = (id: string, updates: Partial<LineaPago>) => {
    setLineasPago((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...updates } : l))
    );
  };

  const asignarRestanteALinea = (id: string) => {
    const sumaOtras = lineasPago
      .filter((l) => l.id !== id)
      .reduce((acc, l) => acc + (parseFloat(l.monto) || 0), 0);
    const restante = Math.max(0, Number((total - sumaOtras).toFixed(2)));
    actualizarLineaPago(id, { monto: restante.toFixed(2) });
  };

  const esTarjetaValida = (num: string) => {
    const soloNumeros = num.replace(/\s|-/g, '');
    return /^\d{15,16}$/.test(soloNumeros);
  };

  const handleBuscarNit = async () => {
    if (!nit.trim()) return;
    setBuscando(true);
    setError('');
    try {
      const resp = await buscarClientes(nit.trim());
      if (resp?.data && resp.data.length > 0) {
        const c = resp.data[0];
        setIdCliente(c.idCliente);
        setNombre(c.nombreCliente);
        setTelefono(c.telefonoCliente || '');
        setDireccion(c.direccionCliente || 'Ciudad');
      } else {
        setIdCliente(null);
        setError('Cliente no registrado. Ingresa su nombre para registrarlo automáticamente.');
      }
    } catch {
      setError('Error al consultar cliente.');
    } finally {
      setBuscando(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !user?.idUsuario) return;

    if (modoPago === 'UNICO') {
      if (metodoPago === 1 && Number(montoEfectivo) < total) {
        const msg = `El monto recibido en efectivo (Q ${Number(montoEfectivo).toFixed(2)}) es menor al total a pagar (Q ${total.toFixed(2)}).`;
        setError(msg);
        mostrarError(msg, 'Monto insuficiente');
        return;
      }

      if (metodoPago === 2 && !esTarjetaValida(numeroTarjeta)) {
        const msg = 'El número de tarjeta debe contener entre 15 y 16 dígitos numéricos.';
        setError(msg);
        mostrarError(msg, 'Tarjeta inválida');
        return;
      }

      if (metodoPago === 3 && !referenciaPago.trim()) {
        const msg = 'Ingresa el número de comprobante o referencia bancaria.';
        setError(msg);
        mostrarError(msg, 'Referencia requerida');
        return;
      }
    } else {
      // Modo MIXTO
      if (lineasPago.length < 2) {
        const msg = 'El pago mixto requiere al menos 2 métodos de pago configurados.';
        setError(msg);
        mostrarError(msg, 'Métodos insuficientes');
        return;
      }

      if (!estaCuadradoMixto) {
        const msg =
          saldoRestanteMixto > 0
            ? `Aún faltan Q ${saldoRestanteMixto.toFixed(2)} para completar el total de la venta.`
            : `El total de pagos asignados supera por Q ${Math.abs(saldoRestanteMixto).toFixed(2)} el total de la venta.`;
        setError(msg);
        mostrarError(msg, 'Descuadre de Pagos');
        return;
      }

      for (let i = 0; i < lineasPago.length; i++) {
        const l = lineasPago[i];
        const monto = parseFloat(l.monto);
        if (isNaN(monto) || monto <= 0) {
          const msg = `El método #${i + 1} debe tener un monto válido mayor a cero.`;
          setError(msg);
          mostrarError(msg, 'Monto inválido');
          return;
        }

        if (l.idMedioPago === 1 && l.montoRecibido) {
          const entregado = parseFloat(l.montoRecibido);
          if (entregado < monto) {
            const msg = `En el método #${i + 1} (Efectivo), el dinero entregado (Q ${entregado.toFixed(2)}) no puede ser menor al monto a abonar (Q ${monto.toFixed(2)}).`;
            setError(msg);
            mostrarError(msg, 'Efectivo insuficiente');
            return;
          }
        }

        if (l.idMedioPago === 2 && !esTarjetaValida(l.numeroTarjeta || '')) {
          const msg = `En el método #${i + 1} (Tarjeta), ingresa un número de tarjeta válido (15 a 16 dígitos).`;
          setError(msg);
          mostrarError(msg, 'Tarjeta inválida');
          return;
        }

        if (l.idMedioPago === 3 && !l.referencia?.trim()) {
          const msg = `En el método #${i + 1} (Transferencia), ingresa la referencia o comprobante.`;
          setError(msg);
          mostrarError(msg, 'Referencia requerida');
          return;
        }
      }
    }

    setProcesando(true);
    setError('');

    try {
      let finalClienteId = idCliente;
      if (!finalClienteId) {
        const resCli = await registrarCliente({
          nitCliente: nit.trim() || 'CF',
          nombreCliente: nombre.trim() || 'Consumidor Final',
          telefonoCliente: telefono.trim(),
          direccionCliente: direccion.trim() || 'Ciudad',
        });
        finalClienteId = resCli.data.idCliente;
      }

      const numFactura = `FAC-${Date.now()}`;

      const pagos =
        modoPago === 'UNICO'
          ? [
              {
                idMedioPago: metodoPago,
                montoPago: total,
                referenciaPago:
                  metodoPago === 1
                    ? 'EFECTIVO'
                    : metodoPago === 2
                    ? `TARJETA-****${numeroTarjeta.replace(/\s|-/g, '').slice(-4)}`
                    : referenciaPago.trim() || 'TRANSF',
              },
            ]
          : lineasPago.map((l) => ({
              idMedioPago: l.idMedioPago,
              montoPago: parseFloat(l.monto),
              referenciaPago:
                l.idMedioPago === 1
                  ? 'EFECTIVO'
                  : l.idMedioPago === 2
                  ? `TARJETA-****${(l.numeroTarjeta || '').replace(/\s|-/g, '').slice(-4)}`
                  : l.referencia?.trim() || 'TRANSF',
            }));

      const resFactura = await emitirFactura({
        idCotizacion: cotizacionOrigen?.idCotizacion || undefined,
        idCliente: finalClienteId,
        idUsuario: user.idUsuario,
        numeroFactura: numFactura,
        totalFactura: total,
        detalles: items.map((i) => ({
          idProducto: i.idProducto,
          cantidadVendida: i.cantidad,
          precioVendido: Number(i.precioVentaProducto),
          subtotalVendido: Number(i.precioVentaProducto) * i.cantidad,
        })),
        pagos,
      });

      // Obtener detalle completo de la factura para impresión
      const factImpResp = await obtenerFacturaParaImpresion(resFactura.data.idFactura);
      vaciarCarrito();
      onClose();
      mostrarExito(
        `Factura ${numFactura} emitida exitosamente. Inventario rebajado según método FIFO.`,
        'Venta Exitosa'
      );
      onFacturaEmitida(factImpResp.data as unknown as Factura);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al procesar la factura y stock FIFO';
      setError(msg);
      mostrarError(msg, 'Fallo en Facturación');
    } finally {
      setProcesando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Cobro y Emisión de Factura"
      description={`Total a cobrar: Q ${total.toFixed(2)} (${items.length} productos en orden).`}
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold" role="alert">
            {error}
          </div>
        )}

        {/* Datos del Cliente */}
        <div>
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
            1. Datos de Facturación
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button
              type="button"
              onClick={() => {
                setTipoCliente('CF');
                setNit('CF');
                setNombre('Consumidor Final');
                setIdCliente(5);
              }}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                tipoCliente === 'CF'
                  ? 'bg-blue-50 border-[#1e3a8a] text-[#1e3a8a] shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Consumidor Final (CF)
            </button>
            <button
              type="button"
              onClick={() => {
                setTipoCliente('NIT');
                setNit('');
                setNombre('');
                setIdCliente(null);
              }}
              className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                tipoCliente === 'NIT'
                  ? 'bg-blue-50 border-[#1e3a8a] text-[#1e3a8a] shadow-xs'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              Con NIT o Razón Social
            </button>
          </div>

          {tipoCliente === 'NIT' && (
            <div className="space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    label="NIT"
                    placeholder="ej. 123456-K"
                    required
                    value={nit}
                    onChange={(e) => {
                      setNit(e.target.value);
                      setIdCliente(null);
                    }}
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBuscarNit}
                  cargando={buscando}
                >
                  Buscar
                </Button>
              </div>
              <Input
                label="Nombre del Cliente"
                placeholder="Nombre o Razón Social"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Modalidad de Pago: Único vs Mixto */}
        <div className="pt-2 border-t border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
              2. Método de Pago
            </label>
            <span className="text-xs text-gray-500">
              Total Venta: <strong className="text-gray-900 font-black">Q {total.toFixed(2)}</strong>
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-3 bg-gray-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setModoPago('UNICO')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modoPago === 'UNICO'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🔘</span>
              <span>Pago Único (1 Método)</span>
            </button>
            <button
              type="button"
              onClick={() => setModoPago('MIXTO')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                modoPago === 'MIXTO'
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span>🔀</span>
              <span>Pago Mixto (2+ Métodos)</span>
            </button>
          </div>

          {/* MODO PAGO ÚNICO */}
          {modoPago === 'UNICO' && (
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                {METODOS_PAGO.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMetodoPago(m.id)}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col items-center gap-1 ${
                      metodoPago === m.id
                        ? 'bg-[#1e3a8a] text-white border-[#1e3a8a] shadow-xs'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base">{m.icon}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>

              {metodoPago === 1 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <Input
                    label="Monto entregado por el cliente (Q)"
                    type="number"
                    step="0.01"
                    min={total}
                    required
                    placeholder={total.toFixed(2)}
                    value={montoEfectivo}
                    onChange={(e) => setMontoEfectivo(e.target.value)}
                  />
                  <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-1">
                    <span>Cambio a devolver:</span>
                    <span className="text-base text-emerald-600 font-mono">
                      Q {cambioEfectivo.toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {metodoPago === 2 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <Input
                    label="Número de Tarjeta (15 a 16 dígitos)"
                    placeholder="4000 1234 5678 9010"
                    required
                    maxLength={19}
                    value={numeroTarjeta}
                    onChange={(e) => setNumeroTarjeta(e.target.value)}
                    helperText="Se almacenarán únicamente los últimos 4 dígitos por seguridad."
                  />
                </div>
              )}

              {metodoPago === 3 && (
                <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2">
                  <Input
                    label="No. de Comprobante / Referencia Bancaria"
                    placeholder="ej. TRANSF-091823"
                    required
                    value={referenciaPago}
                    onChange={(e) => setReferenciaPago(e.target.value)}
                  />
                </div>
              )}
            </div>
          )}

          {/* MODO PAGO MIXTO */}
          {modoPago === 'MIXTO' && (
            <div className="space-y-3">
              {/* Filas de pago configuradas */}
              <div className="space-y-3">
                {lineasPago.map((linea, index) => {
                  const sumaOtras = lineasPago
                    .filter((l) => l.id !== linea.id)
                    .reduce((acc, l) => acc + (parseFloat(l.monto) || 0), 0);
                  const remanenteParaEsta = Math.max(0, Number((total - sumaOtras).toFixed(2)));

                  const cambioLineaEfectivo =
                    linea.idMedioPago === 1 && linea.montoRecibido && linea.monto
                      ? Math.max(0, Number(linea.montoRecibido) - Number(linea.monto))
                      : 0;

                  return (
                    <div
                      key={linea.id}
                      className="p-3.5 bg-gray-50/90 rounded-2xl border border-gray-200/90 space-y-2.5 relative shadow-2xs"
                    >
                      <div className="flex items-center justify-between pb-1.5 border-b border-gray-200/60">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#1e3a8a] text-white text-[11px] font-bold flex items-center justify-center">
                            {index + 1}
                          </span>
                          <span className="text-xs font-bold text-gray-700">
                            Método de Pago #{index + 1}
                          </span>
                        </div>

                        {lineasPago.length > 2 && (
                          <button
                            type="button"
                            onClick={() => eliminarLineaPago(linea.id)}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 cursor-pointer"
                            title="Eliminar este método de pago"
                          >
                            ✕ Quitar
                          </button>
                        )}
                      </div>

                      {/* Selector de medio para esta fila */}
                      <div className="grid grid-cols-3 gap-1.5">
                        {METODOS_PAGO.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => actualizarLineaPago(linea.id, { idMedioPago: m.id })}
                            className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                              linea.idMedioPago === m.id
                                ? 'bg-white text-[#1e3a8a] border-[#1e3a8a] shadow-xs font-bold'
                                : 'bg-transparent border-transparent text-gray-500 hover:bg-white/60'
                            }`}
                          >
                            <span>{m.icon}</span>
                            <span>{m.label}</span>
                          </button>
                        ))}
                      </div>

                      {/* Input de monto a cubrir y botón auto-completar */}
                      <div className="space-y-1">
                        <div className="flex items-end gap-2">
                          <div className="flex-1">
                            <Input
                              label="Monto a cubrir con este método (Q)"
                              type="number"
                              step="0.01"
                              min="0.01"
                              max={total}
                              required
                              placeholder="0.00"
                              value={linea.monto}
                              onChange={(e) =>
                                actualizarLineaPago(linea.id, { monto: e.target.value })
                              }
                            />
                          </div>

                          {remanenteParaEsta > 0 &&
                            Number(linea.monto) !== remanenteParaEsta && (
                              <button
                                type="button"
                                onClick={() => asignarRestanteALinea(linea.id)}
                                className="h-10 px-3 bg-blue-50 hover:bg-blue-100 text-[#1e3a8a] text-xs font-bold rounded-xl border border-blue-200 transition-colors whitespace-nowrap cursor-pointer"
                                title="Asignar el saldo pendiente a este método"
                              >
                                Cubrir: Q {remanenteParaEsta.toFixed(2)}
                              </button>
                            )}
                        </div>
                      </div>

                      {/* Campos específicos por método en pago mixto */}
                      {linea.idMedioPago === 1 && (
                        <div className="p-2.5 bg-white rounded-xl border border-gray-100 space-y-1.5">
                          <Input
                            label="Efectivo entregado por el cliente (Q) (opcional)"
                            type="number"
                            step="0.01"
                            placeholder={linea.monto || '0.00'}
                            value={linea.montoRecibido || ''}
                            onChange={(e) =>
                              actualizarLineaPago(linea.id, { montoRecibido: e.target.value })
                            }
                            helperText="Ingresa el billete si el cliente dio más para calcular su vuelto."
                          />
                          {cambioLineaEfectivo > 0 && (
                            <div className="flex justify-between items-center text-xs font-bold text-gray-700 pt-1">
                              <span>Cambio de este pago:</span>
                              <span className="text-emerald-600 font-mono font-black">
                                Q {cambioLineaEfectivo.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {linea.idMedioPago === 2 && (
                        <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                          <Input
                            label="Número de Tarjeta (15 a 16 dígitos)"
                            placeholder="4000 1234 5678 9010"
                            required
                            maxLength={19}
                            value={linea.numeroTarjeta || ''}
                            onChange={(e) =>
                              actualizarLineaPago(linea.id, { numeroTarjeta: e.target.value })
                            }
                            helperText="Se guardarán únicamente los últimos 4 dígitos."
                          />
                        </div>
                      )}

                      {linea.idMedioPago === 3 && (
                        <div className="p-2.5 bg-white rounded-xl border border-gray-100">
                          <Input
                            label="No. de Comprobante / Referencia Bancaria"
                            placeholder="ej. TRANSF-908123"
                            required
                            value={linea.referencia || ''}
                            onChange={(e) =>
                              actualizarLineaPago(linea.id, { referencia: e.target.value })
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Botón para añadir otra fila */}
              {lineasPago.length < 5 && (
                <button
                  type="button"
                  onClick={agregarLineaPago}
                  className="w-full py-2 border-2 border-dashed border-gray-300 hover:border-[#1e3a8a] text-gray-600 hover:text-[#1e3a8a] text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer bg-white"
                >
                  <span>+</span>
                  <span>Agregar otro método de pago</span>
                </button>
              )}

              {/* Panel de Cuadratura en tiempo real */}
              <div className="p-3 rounded-xl border bg-white space-y-1.5 shadow-2xs">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Total Factura:</span>
                  <span className="font-bold text-gray-900 font-mono">Q {total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-500">Total Asignado en Métodos:</span>
                  <span className="font-bold text-gray-900 font-mono">
                    Q {totalDistribuidoMixto.toFixed(2)}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-xs font-bold text-gray-700">Estado de Cuadratura:</span>
                  {estaCuadradoMixto ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                      ✓ ¡Total Cubierto Exacto!
                    </span>
                  ) : saldoRestanteMixto > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                      Faltan Q {saldoRestanteMixto.toFixed(2)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                      Excedido por Q {Math.abs(saldoRestanteMixto).toFixed(2)}
                    </span>
                  )}
                </div>

                {cambioTotalMixto > 0 && (
                  <div className="pt-1.5 border-t border-dashed border-gray-100 flex justify-between items-center text-xs font-bold text-emerald-700">
                    <span>💵 Cambio total a devolver en efectivo:</span>
                    <span className="font-mono text-sm">Q {cambioTotalMixto.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={procesando}>
            Cancelar
          </Button>

          <Button
            type="submit"
            variant="secondary"
            cargando={procesando}
            disabled={modoPago === 'MIXTO' && !estaCuadradoMixto}
          >
            Confirmar Cobro y Facturar
          </Button>
        </div>
      </form>
    </Modal>
  );
};
