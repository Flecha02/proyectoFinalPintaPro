'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { RolUsuario } from '../../lib/types';

export interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles?: RolUsuario[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, cargando, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && allowedRoles.length > 0) {
        const canAccess = allowedRoles.some((r) => hasRole(r));
        if (!canAccess) {
          // Redirigir a la vista que le corresponda
          const rol = user.rol?.toUpperCase();
          if (rol === 'CAJERO') {
            router.push('/cajero');
          } else if (rol === 'DIGITADOR') {
            router.push('/productos');
          } else {
            router.push('/admin');
          }
        }
      }
    }
  }, [user, cargando, allowedRoles, router, hasRole]);

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Cargando sesión...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.some((r) => hasRole(r))) {
    return null;
  }

  return <>{children}</>;
};
