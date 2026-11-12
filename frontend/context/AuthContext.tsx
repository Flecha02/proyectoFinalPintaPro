'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { iniciarSesion } from '../lib/api';
import { UsuarioSesion } from '../lib/types';

interface AuthContextType {
  user: UsuarioSesion | null;
  cargando: boolean;
  login: (correo: string, contrasenia: string) => Promise<UsuarioSesion>;
  logout: () => void;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<UsuarioSesion | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('usuario');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {
      localStorage.removeItem('usuario');
    } finally {
      setCargando(false);
    }
  }, []);

  const login = async (correo: string, contrasenia: string): Promise<UsuarioSesion> => {
    const resp = await iniciarSesion(correo, contrasenia);
    const usuario: UsuarioSesion = {
      idUsuario: resp.data.idUsuario,
      nombreUsuario: resp.data.nombreUsuario,
      correoUsuario: resp.data.correoUsuario,
      rol: resp.data.rol?.toUpperCase() || 'DIGITADOR',
    };
    setUser(usuario);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    return usuario;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('usuario');
    router.push('/login');
  };

  const hasRole = (...roles: string[]) => {
    if (!user || !user.rol) return false;
    const currentRol = user.rol.toUpperCase();
    return roles.map((r) => r.toUpperCase()).includes(currentRol);
  };

  return (
    <AuthContext.Provider value={{ user, cargando, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser utilizado dentro de un AuthProvider');
  }
  return context;
}
