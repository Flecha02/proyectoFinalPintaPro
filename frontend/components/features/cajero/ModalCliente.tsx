'use client';

import React, { useEffect, useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { Cliente } from '../../../lib/types';
import { actualizarCliente, registrarCliente } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export interface ModalClienteProps {
  isOpen: boolean;
  onClose: () => void;
  clienteAEditar?: Cliente | null;
  onGuardadoExitoso: (cliente: Cliente, esNuevo: boolean) => void;
}

export const ModalCliente: React.FC<ModalClienteProps> = ({
  isOpen,
  onClose,
  clienteAEditar,
  onGuardadoExitoso,
}) => {
  const { mostrarError } = useToast();
  const [nombre, setNombre] = useState('');
  const [nit, setNit] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [esCF, setEsCF] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (clienteAEditar) {
        setNombre(clienteAEditar.nombreCliente);
        setNit(clienteAEditar.nitCliente);
        setTelefono(clienteAEditar.telefonoCliente || '');
        setDireccion(clienteAEditar.direccionCliente || '');
        setEsCF(clienteAEditar.nitCliente.toUpperCase() === 'CF');
      } else {
        setNombre('');
        setNit('');
        setTelefono('');
        setDireccion('');
        setEsCF(false);
      }
      setError(null);
    }
  }, [isOpen, clienteAEditar]);

  const handleToggleCF = (checked: boolean) => {
    setEsCF(checked);
    if (checked) {
      setNit('CF');
    } else if (nit === 'CF') {
      setNit('');
    }
  };

  const handleNitChange = (val: string) => {
    const upper = val.toUpperCase();
    setNit(upper);
    setEsCF(upper === 'CF');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!nombre.trim()) {
      const msg = 'El nombre del cliente es obligatorio.';
      setError(msg);
      mostrarError(msg);
      return;
    }

    // Regla solicitada: si no tiene NIT, se asigna 'CF' en automático
    const nitFinal = nit.trim() === '' ? 'CF' : nit.trim().toUpperCase();

    setCargando(true);
    try {
      if (clienteAEditar) {
        await actualizarCliente(clienteAEditar.idCliente, {
          nombreCliente: nombre.trim(),
          nitCliente: nitFinal,
          telefonoCliente: telefono.trim() ? telefono.trim() : null,
          direccionCliente: direccion.trim() ? direccion.trim() : null,
        });

        onGuardadoExitoso(
          {
            idCliente: clienteAEditar.idCliente,
            nombreCliente: nombre.trim(),
            nitCliente: nitFinal,
            telefonoCliente: telefono.trim() || null,
            direccionCliente: direccion.trim() || null,
          },
          false,
        );
      } else {
        const resp = await registrarCliente({
          nombreCliente: nombre.trim(),
          nitCliente: nitFinal,
          telefonoCliente: telefono.trim() || null,
          direccionCliente: direccion.trim() || null,
        });

        onGuardadoExitoso(
          {
            idCliente: resp.data?.idCliente || Date.now(),
            nombreCliente: nombre.trim(),
            nitCliente: nitFinal,
            telefonoCliente: telefono.trim() || null,
            direccionCliente: direccion.trim() || null,
          },
          true,
        );
      }
      onClose();
    } catch (err: any) {
      const msg = err.message || 'Error al guardar el cliente';
      setError(msg);
      mostrarError(msg);
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={clienteAEditar ? 'Editar Información del Cliente' : 'Registrar Nuevo Cliente'}
      description="Completa los datos del cliente para facturación y cotizaciones."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <Alert tipo="error" mensaje={error} />}

        <Input
          label="Nombre o Razón Social"
          required
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Ej. Juan Pérez o Comercial La Pintura S.A."
          leftIcon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 tracking-wide">
              NIT o DPI
            </label>
            <label className="flex items-center gap-1.5 text-xs text-blue-700 cursor-pointer font-medium hover:text-blue-900 select-none">
              <input
                type="checkbox"
                checked={esCF}
                onChange={(e) => handleToggleCF(e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-500 h-3.5 w-3.5"
              />
              Asignar CF (Consumidor Final)
            </label>
          </div>

          <div className="relative rounded-xl shadow-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
              </svg>
            </div>
            <input
              type="text"
              value={nit}
              onChange={(e) => handleNitChange(e.target.value)}
              placeholder="Ej. 1234567-8 o dejar vacío para 'CF'"
              className="w-full pl-9 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition duration-150"
            />
          </div>
          <p className="text-xs text-gray-500">
            {nit.trim() === '' || nit.trim().toUpperCase() === 'CF' ? (
              <span className="text-emerald-700 font-medium">✓ Se registrará como &apos;CF&apos; (Consumidor Final) automáticamente.</span>
            ) : (
              <span>NIT o DPI sin guiones o con formato estándar de Guatemala.</span>
            )}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Teléfono (opcional)"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="Ej. 5555-1234"
            helperText="Formato válido de 8 dígitos para Guatemala."
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            }
          />

          <Input
            label="Dirección (opcional)"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            placeholder="Ej. Ciudad de Guatemala o Zona 1"
            leftIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            }
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="secondary" cargando={cargando}>
            {clienteAEditar ? 'Guardar Cambios' : 'Registrar Cliente'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
