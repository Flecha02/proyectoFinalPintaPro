'use client';

import React, { useState } from 'react';
import { Proveedor } from '../../../lib/types';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Modal } from '../../ui/Modal';
import {
  MENSAJES,
  esNit,
  esNombreCliente,
  esTelefono,
  normalizarTexto,
} from '../../../lib/validators';

export interface ProveedoresSectionProps {
  proveedores: Proveedor[];
  onCrearProveedor: (prov: {
    nitProveedor: string;
    nombreProveedor: string;
    telefonoProveedor: string;
    direccionProveedor: string;
  }) => Promise<void>;
}

interface ErroresProveedor {
  nit?: string;
  nombre?: string;
  telefono?: string;
}

export const ProveedoresSection: React.FC<ProveedoresSectionProps> = ({
  proveedores,
  onCrearProveedor,
}) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [nit, setNit] = useState('');
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<ErroresProveedor>({});

  const validar = (): ErroresProveedor => {
    const nuevosErrores: ErroresProveedor = {};

    if (!esNit(nit)) {
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
    setError('');

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setCargando(true);
    try {
      await onCrearProveedor({
        nitProveedor: normalizarTexto(nit).toUpperCase(),
        nombreProveedor: normalizarTexto(nombre),
        telefonoProveedor: normalizarTexto(telefono),
        direccionProveedor: normalizarTexto(direccion),
      });
      setNit('');
      setNombre('');
      setTelefono('');
      setDireccion('');
      setErrores({});
      setModalAbierto(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al registrar el proveedor');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Proveedores</h2>
          <p className="text-xs text-gray-400">Proveedores registrados en el sistema</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setModalAbierto(true)}
          className="text-[#1e3a8a] border-blue-200 hover:bg-blue-50"
        >
          + Nuevo Proveedor
        </Button>
      </div>

      <div className="overflow-y-auto max-h-72 space-y-2.5 pr-1">
        {proveedores.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-6">No hay proveedores registrados.</p>
        ) : (
          proveedores.map((p) => (
            <div
              key={p.idProveedor}
              className="p-3 rounded-xl border border-gray-100 bg-gray-50/75 hover:bg-white hover:border-gray-200 transition-all text-xs"
            >
              <div className="font-bold text-gray-900">{p.nombreProveedor}</div>
              <div className="text-gray-500 mt-0.5">
                <span className="font-medium text-gray-700">NIT:</span> {p.nitProveedor}
              </div>
              {p.telefonoProveedor && (
                <div className="text-gray-500">
                  <span className="font-medium text-gray-700">Tel:</span> {p.telefonoProveedor}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <Modal
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        title="Registrar Nuevo Proveedor"
        description="Ingresa los datos del nuevo proveedor para órdenes de compra."
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
              {error}
            </div>
          )}

          <Input
            label="NIT del Proveedor"
            required
            placeholder="ej. 876543-2 o CF"
            value={nit}
            onChange={(e) => {
              setNit(e.target.value);
              setErrores((prev) => ({ ...prev, nit: undefined }));
            }}
            error={errores.nit}
            helperText="CF, C/F o formato guatemalteco válido."
          />

          <Input
            label="Nombre o Razón Social"
            required
            placeholder="ej. Distribuidora de Pinturas Celco S.A."
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value);
              setErrores((prev) => ({ ...prev, nombre: undefined }));
            }}
            error={errores.nombre}
            helperText="Solo letras, tildes, ñ, espacios, puntos y comas."
          />

          <Input
            label="Teléfono"
            placeholder="ej. 2345-6789"
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
            placeholder="ej. Zona 12, Ciudad de Guatemala"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="outline" onClick={() => setModalAbierto(false)}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" cargando={cargando}>
              Guardar Proveedor
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
