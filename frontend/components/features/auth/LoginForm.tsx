'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../context/AuthContext';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { Alert } from '../../ui/Alert';
import { useToast } from '../../../context/ToastContext';

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { mostrarExito, mostrarError } = useToast();

  const [correo, setCorreo] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setCargando(true);

    try {
      const usuario = await login(correo, contrasenia);
      mostrarExito(`Bienvenido ${usuario.nombreUsuario}`, 'Inicio de Sesión Exitoso');
      const rol = usuario.rol?.toUpperCase();

      if (rol === 'CAJERO') {
        router.push('/cajero');
      } else if (rol === 'GERENTE' || rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
        router.push('/admin');
      } else {
        router.push('/productos');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Credenciales inválidas o error de conexión';
      setError(msg);
      mostrarError(msg, 'Acceso Denegado');
    } finally {
      setCargando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {error && (
        <Alert tipo="error" mensaje={error} onDismiss={() => setError('')} />
      )}

      <Input
        label="Correo electrónico"
        type="email"
        placeholder="ejemplo@pintapro.com"
        autoComplete="email"
        required
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
          </svg>
        }
      />

      <Input
        label="Contraseña"
        type="password"
        placeholder="••••••••"
        autoComplete="current-password"
        required
        value={contrasenia}
        onChange={(e) => setContrasenia(e.target.value)}
        leftIcon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        }
      />

      <Button
        type="submit"
        variant="secondary"
        cargando={cargando}
        fullWidth
        size="lg"
        className="mt-2"
      >
        {cargando ? 'Iniciando sesión...' : 'Ingresar al sistema'}
      </Button>
    </form>
  );
};
