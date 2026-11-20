'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { Button } from '../../ui/Button';
import { Badge } from '../../ui/Badge';
import { Alert } from '../../ui/Alert';
import { ModalUsuario } from './ModalUsuario';
import { RolApi, UsuarioApi, listarRoles, listarUsuarios } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';

export const UsuariosSection: React.FC = () => {
  const { mostrarError } = useToast();
  const [usuarios, setUsuarios] = useState<UsuarioApi[]>([]);
  const [roles, setRoles] = useState<RolApi[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [modalAbierto, setModalAbierto] = useState(false);

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    setError('');
    try {
      const [respUsuarios, respRoles] = await Promise.all([listarUsuarios(), listarRoles()]);
      setUsuarios(respUsuarios.data || []);
      setRoles(respRoles.data || []);
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'No se pudo cargar la gestión de usuarios';
      setError(mensaje);
      mostrarError(mensaje, 'Error de Usuarios');
    } finally {
      setCargando(false);
    }
  }, [mostrarError]);

  useEffect(() => {
    // Carga inicial de usuarios y roles desde la API (mismo patrón usado en las demás páginas).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    cargarDatos();
  }, [cargarDatos]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Gestión de Usuarios</h2>
          <p className="text-xs text-gray-400">
            Alta de usuarios corporativos con acceso al sistema (exclusivo de Gerencia).
          </p>
        </div>
        <Button variant="primary" size="md" onClick={() => setModalAbierto(true)} disabled={roles.length === 0}>
          + Nuevo Usuario
        </Button>
      </div>

      {error && <Alert tipo="error" mensaje={error} onDismiss={() => setError('')} />}

      {cargando ? (
        <Card>
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-3 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm text-gray-500 font-medium">Cargando usuarios del sistema...</p>
          </div>
        </Card>
      ) : usuarios.length === 0 ? (
        <Card>
          <p className="text-sm text-gray-500 text-center py-8">
            No hay usuarios registrados todavía. Crea el primero con el botón “Nuevo Usuario”.
          </p>
        </Card>
      ) : (
        <Card padding="none">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">ID</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Nombre</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Correo</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Rol</th>
                  <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-gray-500">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {usuarios.map((usuario) => (
                  <tr key={usuario.idUsuario} className="hover:bg-gray-50/75 transition-colors">
                    <td className="px-4 py-3 text-xs font-mono text-gray-500">#{usuario.idUsuario}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900">{usuario.nombreUsuario}</td>
                    <td className="px-4 py-3 text-xs text-gray-600">{usuario.correoUsuario}</td>
                    <td className="px-4 py-3">
                      <Badge variant="info" size="sm">{usuario.nombreRol}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={usuario.estadoUsuario ? 'success' : 'danger'} size="sm">
                        {usuario.estadoUsuario ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {modalAbierto && (
        <ModalUsuario
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          roles={roles}
          onUsuarioCreado={cargarDatos}
        />
      )}
    </div>
  );
};
