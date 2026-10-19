'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Image from 'next/image';
import { iniciarSesion } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [correoUsuario, setCorreoUsuario] = useState('');
  const [contraseniaUsuario, setContraseniaUsuario] = useState('');
  const [mensajeError, setMensajeError] = useState('');
  const [cargando, setCargando] = useState(false);

  const handleLogin = async (event) => {
    event.preventDefault();
    setMensajeError('');
    setCargando(true);

    try {
      const respuesta = await iniciarSesion(correoUsuario, contraseniaUsuario);
      localStorage.setItem('usuario', JSON.stringify(respuesta.data));
      router.push(respuesta.data.rol === 'CAJERO' ? '/cajero' : '/productos');
    } catch (error) {
      setMensajeError(error instanceof Error ? error.message : 'No fue posible iniciar sesión');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fondo dividido: Azul a la izquierda y Amarillo a la derecha */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-[#4285F4] relative flex items-center justify-start">
          {/* Ilustración de la lata de pintura izquierda */}
          <div className="relative w-100 h-100">
            <Image 
              src="/cubeta.png" 
              alt="Pintura" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
        <div className="w-1/2 bg-[#F4C430] relative flex items-center justify-end">
          {/* Ilustración de la rodillo/bandeja derecha */}
          <div className="relative w-100 h-100">
            <Image 
              src="/bandeja.png" 
              alt="Bandeja" 
              fill 
              className="object-contain" 
            />
          </div>
        </div>
      </div>

      {/* Tarjeta del Formulario Flotante en el Centro */}
      <div className="relative z-10 w-full max-w-md p-8 bg-white rounded-3xl shadow-2xl flex flex-col items-center">
        <h1 className="text-xl font-bold text-gray-800 mb-2">Bienvenido a</h1>
        
        {/* Logo PintaPro */}
        <div className="relative w-30 h-30 mb-6">
          <Image 
            src="/PintaPro.png" 
            alt="PintaPro Logo" 
            fill 
            className="object-contain" 
          />
        </div>

        {/* Formulario */}
        <form className="w-full space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Ingrese su correo:
            </label>
            <input 
              type="email"
              placeholder="Correo electrónico"
              autoComplete="email"
              required
              value={correoUsuario}
              onChange={(event) => setCorreoUsuario(event.target.value)}
              className="input input-bordered w-full rounded-xl bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
    />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Ingrese su contraseña:
            </label>
            <input 
              type="password"
              placeholder="Contraseña"
              autoComplete="current-password"
              required
              value={contraseniaUsuario}
              onChange={(event) => setContraseniaUsuario(event.target.value)}
              className="input input-bordered w-full rounded-xl bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
            />
          </div>

          {mensajeError && (
            <p className="text-sm text-red-600" role="alert">{mensajeError}</p>
          )}

          <button 
            type="submit" 
            disabled={cargando}
            className="btn w-full bg-[#E07A00] hover:bg-[#c66c00] text-white border-none rounded-xl mt-4 font-normal"
          >
            {cargando ? 'Conectando...' : 'Ingresar al sistema'}
          </button>
        </form>
      </div>
    </div>
  );
}