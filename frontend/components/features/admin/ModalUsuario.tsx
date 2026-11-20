'use client';

import React, { useState } from 'react';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import { RolApi, registrarUsuario } from '../../../lib/api';
import { useToast } from '../../../context/ToastContext';
import {
  MENSAJES,
  esCorreoPintapro,
  esNombrePersona,
  esPasswordSegura,
  normalizarCorreo,
  normalizarTexto,
} from '../../../lib/validators';

export interface ModalUsuarioProps {
  isOpen: boolean;
  onClose: () => void;
  roles: RolApi[];
  onUsuarioCreado: () => void;
}

interface ErroresFormulario {
  nombreUsuario?: string;
  correoUsuario?: string;
  contraseniaUsuario?: string;
  confirmarContrasenia?: string;
  idRol?: string;
}

export const ModalUsuario: React.FC<ModalUsuarioProps> = ({
  isOpen,
  onClose,
  roles,
  onUsuarioCreado,
}) => {
  const { mostrarExito, mostrarError } = useToast();
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [contraseniaUsuario, setContraseniaUsuario] = useState('');
  const [confirmarContrasenia, setConfirmarContrasenia] = useState('');
  const [idRol, setIdRol] = useState<number | ''>(
    () => roles.find((r) => r.nombreRol.toUpperCase() === 'DIGITADOR')?.idRol || roles[0]?.idRol || '',
  );
  const [errores, setErrores] = useState<ErroresFormulario>({});
  const [errorGeneral, setErrorGeneral] = useState('');
  const [cargando, setCargando] = useState(false);

  const validar = (): ErroresFormulario => {
    const nuevosErrores: ErroresFormulario = {};

    if (!esNombrePersona(nombreUsuario)) {
      nuevosErrores.nombreUsuario = MENSAJES.NOMBRE_PERSONA;
    }
    if (!esCorreoPintapro(correoUsuario)) {
      nuevosErrores.correoUsuario = MENSAJES.CORREO_PINTAPRO;
    }
    if (!esPasswordSegura(contraseniaUsuario)) {
      nuevosErrores.contraseniaUsuario = MENSAJES.PASSWORD_SEGURA;
    }
    if (confirmarContrasenia !== contraseniaUsuario) {
      nuevosErrores.confirmarContrasenia = 'Las contraseñas no coinciden.';
    }
    if (!idRol) {
      nuevosErrores.idRol = 'Debes seleccionar un rol para el usuario.';
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorGeneral('');

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setCargando(true);
    try {
      await registrarUsuario({
        idRol: Number(idRol),
        nombreUsuario: normalizarTexto(nombreUsuario),
        correoUsuario: normalizarCorreo(correoUsuario),
        contraseniaUsuario,
      });
      mostrarExito('El usuario fue creado con acceso al sistema.', 'Usuario Registrado');
      onUsuarioCreado();
      onClose();
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error al registrar el usuario';
      setErrorGeneral(mensaje);
      mostrarError(mensaje, 'No se pudo registrar');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Registrar Nuevo Usuario"
      description="Solo el rol Gerente puede crear usuarios corporativos de PintaPro."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {errorGeneral && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
            {errorGeneral}
          </div>
        )}

        <Input
          label="Nombre completo"
          required
          placeholder="ej. Juan Pérez"
          value={nombreUsuario}
          onChange={(e) => {
            setNombreUsuario(e.target.value);
            setErrores((prev) => ({ ...prev, nombreUsuario: undefined }));
          }}
          error={errores.nombreUsuario}
          helperText="Solo letras, tildes, ñ y espacios (2 a 100 caracteres)."
        />

        <Input
          label="Correo corporativo"
          required
          type="email"
          placeholder="ej. juan.perez@pintapro.com"
          value={correoUsuario}
          onChange={(e) => {
            setCorreoUsuario(e.target.value);
            setErrores((prev) => ({ ...prev, correoUsuario: undefined }));
          }}
          error={errores.correoUsuario}
          helperText="Debe pertenecer al dominio @pintapro.com."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Contraseña"
            required
            type="password"
            placeholder="••••••••"
            value={contraseniaUsuario}
            onChange={(e) => {
              setContraseniaUsuario(e.target.value);
              setErrores((prev) => ({ ...prev, contraseniaUsuario: undefined }));
            }}
            error={errores.contraseniaUsuario}
            helperText="Mín. 8 caracteres, mayúscula, minúscula, número y símbolo."
          />

          <Input
            label="Confirmar contraseña"
            required
            type="password"
            placeholder="••••••••"
            value={confirmarContrasenia}
            onChange={(e) => {
              setConfirmarContrasenia(e.target.value);
              setErrores((prev) => ({ ...prev, confirmarContrasenia: undefined }));
            }}
            error={errores.confirmarContrasenia}
          />
        </div>

        <Select
          label="Rol / Cargo"
          required
          value={idRol}
          onChange={(e) => {
            setIdRol(Number(e.target.value));
            setErrores((prev) => ({ ...prev, idRol: undefined }));
          }}
          options={roles.map((rol) => ({
            value: rol.idRol,
            label: rol.nombreRol,
          }))}
          placeholder="Selecciona un rol..."
          error={errores.idRol}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" cargando={cargando}>
            Crear Usuario
          </Button>
        </div>
      </form>
    </Modal>
  );
};
