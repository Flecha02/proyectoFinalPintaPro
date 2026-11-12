'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { LoginBranding } from '../../components/features/auth/LoginBranding';
import { LoginForm } from '../../components/features/auth/LoginForm';

export default function LoginPage() {
  const { user, cargando } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!cargando && user) {
      const rol = user.rol?.toUpperCase();
      if (rol === 'CAJERO') {
        router.push('/cajero');
      } else if (rol === 'GERENTE' || rol === 'ADMIN' || rol === 'ADMINISTRADOR') {
        router.push('/admin');
      } else {
        router.push('/productos');
      }
    }
  }, [user, cargando, router]);

  return (
    <main className="relative min-h-screen w-full flex items-center justify-center p-4">
      <LoginBranding />

      {/* Tarjeta Flotante en el Centro */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/40 flex flex-col items-center">
        <div className="text-center mb-6">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Bienvenido a
          </span>
          <div className="relative w-28 h-28 mx-auto my-2">
            <Image
              src="/PintaPro.png"
              alt="Logo PintaPro"
              fill
              className="object-contain drop-shadow-sm"
              priority
            />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Pinta<span className="text-[#E07A00]">Pro</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Sistema de Gestión, Inventario y Facturación
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}
