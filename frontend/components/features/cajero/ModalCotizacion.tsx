'use client';

import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { buscarClientes, registrarCliente, registrarCotizacion } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import {
  MENSAJES,
  esNit,
  esNombreCliente,
  esTelefono,
  normalizarTexto,
} from '../../../lib/validators';

export interface ModalCotizacionProps {
  isOpen: boolean;
  onClose: () => void;
  onCotizacionExitosa: (idCotizacion: number) => void;
}

interface ErroresCotizacion {
  nit?: string;
  nombre?: string;
  telefono?: string;
}

export const ModalCotizacion: React.FC<ModalCotizacionProps> = ({
  isOpen,
  onClose,
  onCotizacionExitosa,
}) => {
  const { mostrarExito, mostrarError } = useToast();
  const { items, total, vaciarCarrito } = useCart();
  const { user } = useAuth();

  const [nit, setNit] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [idCliente, setIdCliente] = useState<number | null>(null);

  const [buscando, setBuscando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<ErroresCotizacion>({});

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
        setDireccion(c.direccionCliente || '');
      } else {
        setIdCliente(null);
        setError('Cliente no registrado. Completa los datos para registrarlo.');
      }
    } catch {
      setError('Error al consultar cliente por NIT.');
    } finally {
      setBuscando(false);
    }
  };

  const validar = (nitFinal: string): ErroresCotizacion => {
    const nuevosErrores: ErroresCotizacion = {};

    if (!esNit(nitFinal)) {
      nuevosErrores.nit = MENSAJES.NIT;
    }
    if (!esNombreCliente(nombre)) {
      nuevosErrores.nombre = MENSAJES.NOMBRE_CLIENTE;
    }
    if (normalizarTexto(telefono) !== '' && !esTelefono(telefono)) {
      nuevosErrores.telefono = MENSAJES.TELEFONO;
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || !user?.idUsuario) return;

    const nitFinal = normalizarTexto(nit) || 'CF';
    const nuevosErrores = validar(nitFinal);
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setGuardando(true);
    setError('');

    try {
      let clienteId = idCliente;
      if (!clienteId) {
        const resCliente = await registrarCliente({
          nitCliente: nitFinal,
          nombreCliente: normalizarTexto(nombre),
          telefonoCliente: normalizarTexto(telefono),
          direccionCliente: normalizarTexto(direccion),
        });
        clienteId = resCliente.data.idCliente;
      }

      const resCot = await registrarCotizacion({
        idCliente: clienteId,
        idUsuario: user.idUsuario,
        totalCotizacion: total,
        detalles: items.map((i) => ({
          idProducto: i.idProducto,
          cantidadCotizada: i.cantidad,
          precioCotizado: Number(i.precioVentaProducto),
          subtotalCotizado: Number(i.precioVentaProducto) * i.cantidad,
        })),
      });

      vaciarCarrito();
      mostrarExito(`Cotización #${resCot.data.idCotizacion} registrada exitosamente.`, 'Cotización Creada');
      onCotizacionExitosa(resCot.data.idCotizacion);
      onClose();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar la cotización';
      setError(msg);
      mostrarError(msg, 'Error en Cotización');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Guardar Nueva Cotización"
      description={`Cotización por un total de Q ${total.toFixed(2)} (${items.length} productos).`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
            {error}
          </div>
        )}

        {/* Buscador de NIT */}
        <div className="flex gap-2 items-start">
          <div className="flex-1">
            <Input
              label="NIT del Cliente"
              placeholder="ej. 123456-K o CF"
              required
              value={nit}
              onChange={(e) => {
                setNit(e.target.value);
                setIdCliente(null);
                setErrores((prev) => ({ ...prev, nit: undefined }));
              }}
              error={errores.nit}
              helperText="CF, C/F o formato guatemalteco válido."
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleBuscarNit}
            cargando={buscando}
            className="mt-6"
          >
            Buscar NIT
          </Button>
        </div>

        <Input
          label="Nombre del Cliente"
          placeholder="Nombre completo o Razón Social"
          required
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrores((prev) => ({ ...prev, nombre: undefined }));
          }}
          error={errores.nombre}
          helperText="Solo letras, tildes, ñ, espacios, puntos y comas."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Teléfono"
            placeholder="ej. 5555-1234"
            value={telefono}
            onChange={(e) => {
              setTelefono(e.target.value);
              setErrores((prev) => ({ ...prev, telefono: undefined }));
            }}
            error={errores.telefono}
            helperText="8 dígitos, opcionalmente con guion."
          />
          <Input
            label="Dirección"
            placeholder="ej. Quetzaltenango"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={guardando}>
            Cancelar
          </Button>
          <Button type="submit" variant="secondary" cargando={guardando}>
            Emitir Cotización
          </Button>
        </div>
      </form>
    </Modal>
  );
};
