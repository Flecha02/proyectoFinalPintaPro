'use client';

import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Input } from '../../ui/Input';
import { Badge } from '../../ui/Badge';
import { Alert } from '../../ui/Alert';
import { Modal } from '../../ui/Modal';
import { ModalCliente } from './ModalCliente';
import { Cliente } from '../../../lib/types';
import { buscarClientes, eliminarCliente } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export const ClientesSection: React.FC = () => {
  const { mostrarExito, mostrarError } = useToast();
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState('');
  const [cargando, setCargando] = useState(true);

  // Modales
  const [modalAbierto, setModalAbierto] = useState(false);
  const [clienteAEditar, setClienteAEditar] = useState<Cliente | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [eliminando, setEliminando] = useState(false);

  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarClientes = async (criterio = '') => {
    setCargando(true);
    try {
      const resp = await buscarClientes(criterio);
      if (resp && resp.data) {
        setClientes(resp.data);
      }
    } catch (err: any) {
      const msg = err.message || 'Error al cargar el directorio de clientes.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      cargarClientes(busqueda);
    }, 250);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const handleGuardadoExitoso = (cliente: Cliente, esNuevo: boolean) => {
    const msg = esNuevo
      ? `Cliente "${cliente.nombreCliente}" registrado exitosamente con NIT: ${cliente.nitCliente}.`
      : `Cliente "${cliente.nombreCliente}" actualizado correctamente.`;
    setAlerta({ tipo: 'success', mensaje: msg });
    mostrarExito(msg);
    cargarClientes(busqueda);
  };

  const handleConfirmarEliminar = async () => {
    if (!clienteAEliminar) return;
    setEliminando(true);
    try {
      await eliminarCliente(clienteAEliminar.idCliente);
      const msg = `Cliente "${clienteAEliminar.nombreCliente}" eliminado con éxito.`;
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg);
      setClienteAEliminar(null);
      cargarClientes(busqueda);
    } catch (err: any) {
      const msg = err.message || 'No se pudo eliminar el cliente. Verifique que no posea facturas o cotizaciones asociadas.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg);
    } finally {
      setEliminando(false);
    }
  };

  return (
    <div className="space-y-6">
      {alerta && (
        <Alert
          tipo={alerta.tipo}
          mensaje={alerta.mensaje}
          onDismiss={() => setAlerta(null)}
        />
      )}

      {/* Barra de Búsqueda y Acciones */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por NIT, DPI o nombre del cliente..."
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

          <div className="flex items-center gap-3">
            <div className="text-xs text-gray-500 font-medium">
              {clientes.length} {clientes.length === 1 ? 'cliente encontrado' : 'clientes registrados'}
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                setClienteAEditar(null);
                setModalAbierto(true);
              }}
              icono={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              }
            >
              Nuevo Cliente
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabla de Clientes */}
      <Card className="overflow-hidden">
        {cargando ? (
          <div className="flex flex-col items-center justify-center p-12 text-gray-400 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm">Cargando directorio de clientes...</p>
          </div>
        ) : clientes.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-gray-900">No se encontraron clientes</h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              {busqueda
                ? `No hay resultados para "${busqueda}". Intenta con otro NIT o nombre.`
                : 'Aún no hay clientes registrados en el sistema.'}
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setClienteAEditar(null);
                setModalAbierto(true);
              }}
            >
              Registrar el primer cliente
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/75 border-b border-gray-200 text-xs uppercase font-semibold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">NIT / DPI</th>
                  <th className="px-6 py-3.5">Nombre o Razón Social</th>
                  <th className="px-6 py-3.5">Teléfono</th>
                  <th className="px-6 py-3.5">Dirección</th>
                  <th className="px-6 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {clientes.map((c) => {
                  const esCF = c.nitCliente.toUpperCase() === 'CF' || c.nitCliente.toUpperCase() === 'C.F.';
                  return (
                    <tr key={c.idCliente} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        {esCF ? (
                          <Badge variant="neutral">CF (Consumidor Final)</Badge>
                        ) : (
                          <Badge variant="info">{c.nitCliente}</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900 whitespace-nowrap">
                        {c.nombreCliente}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                        {c.telefonoCliente ? (
                          <span className="flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {c.telefonoCliente}
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No especificado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {c.direccionCliente ? (
                          <span className="flex items-center gap-1.5" title={c.direccionCliente}>
                            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span className="truncate">{c.direccionCliente}</span>
                          </span>
                        ) : (
                          <span className="text-gray-400 italic">No especificado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setClienteAEditar(c);
                              setModalAbierto(true);
                            }}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar cliente"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setClienteAEliminar(c)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                            title="Eliminar cliente"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
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

      {/* Modal de Registro / Edición */}
      <ModalCliente
        isOpen={modalAbierto}
        onClose={() => {
          setModalAbierto(false);
          setClienteAEditar(null);
        }}
        clienteAEditar={clienteAEditar}
        onGuardadoExitoso={handleGuardadoExitoso}
      />

      {/* Modal de Confirmación de Eliminación */}
      <Modal
        isOpen={!!clienteAEliminar}
        onClose={() => setClienteAEliminar(null)}
        title="Confirmar Eliminación"
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            ¿Estás seguro de que deseas eliminar al cliente{' '}
            <strong className="text-gray-900">{clienteAEliminar?.nombreCliente}</strong> (NIT:{' '}
            {clienteAEliminar?.nitCliente})? Esta acción no se puede deshacer.
          </p>
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setClienteAEliminar(null)}
              disabled={eliminando}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="sm"
              cargando={eliminando}
              onClick={handleConfirmarEliminar}
            >
              Sí, Eliminar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
