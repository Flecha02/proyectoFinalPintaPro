'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  if (!user) return null;

  const rol = user.rol?.toUpperCase();

  const navLinks = [
    {
      href: '/cajero',
      label: 'Caja / POS',
      visible: hasRole('CAJERO', 'GERENTE', 'ADMIN', 'ADMINISTRADOR'),
    },
    {
      href: '/productos',
      label: 'Catálogo Productos',
      visible: hasRole('DIGITADOR', 'GERENTE', 'ADMIN', 'ADMINISTRADOR'),
    },
    {
      href: '/compras',
      label: 'Compras y Bodega',
      visible: hasRole('DIGITADOR', 'GERENTE', 'ADMIN', 'ADMINISTRADOR'),
    },
    {
      href: '/admin',
      label: 'Panel y Reportes',
      visible: hasRole('GERENTE', 'ADMIN', 'ADMINISTRADOR'),
    },
  ].filter((link) => link.visible);

  const getRolBadgeVariant = (r?: string) => {
    switch (r) {
      case 'GERENTE':
      case 'ADMIN':
      case 'ADMINISTRADOR':
        return 'danger';
      case 'CAJERO':
        return 'success';
      case 'DIGITADOR':
        return 'info';
      default:
        return 'neutral';
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo y Nombre */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 transition-transform group-hover:scale-105">
                <Image
                  src="/PintaPro.png"
                  alt="Logo PintaPro"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="font-black text-xl tracking-tight text-[#1e3a8a]">
                Pinta<span className="text-[#E07A00]">Pro</span>
              </span>
            </Link>

            {/* Enlaces de navegación principales */}
            <nav className="hidden md:flex items-center gap-1.5">
              {navLinks.map((link) => {
                const isActive = pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-[#1e3a8a] text-white shadow-xs'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Información del usuario y botón de cerrar sesión */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-800">
                  {user.nombreUsuario}
                </span>
                <Badge variant={getRolBadgeVariant(rol)} size="sm">
                  {rol}
                </Badge>
              </div>
              <span className="text-xs text-gray-400">{user.correoUsuario}</span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-red-600 hover:bg-red-50 hover:border-red-200"
              icono={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              }
            >
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>

        </div>

        {/* Barra de navegación móvil */}
        <div className="flex md:hidden items-center gap-2 py-2 border-t border-gray-100 overflow-x-auto">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap px-3 py-1 rounded-lg text-xs font-semibold ${
                  isActive
                    ? 'bg-[#1e3a8a] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
};
