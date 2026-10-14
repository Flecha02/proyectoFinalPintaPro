'use client';

import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden">
      {/* Fondo dividido: Azul a la izquierda y Amarillo a la derecha */}
      <div className="absolute inset-0 flex">
        <div className="w-1/2 bg-[#4285F4] relative flex items-center justify-start">
          {/* Ilustración de la lata de pintura izquierda */}
          <div className="relative w-64 h-64">
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
          <div className="relative w-64 h-64">
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
        <div className="relative w-40 h-16 mb-6">
          <Image 
            src="/PintaPro.png" 
            alt="PintaPro Logo" 
            fill 
            className="object-contain" 
          />
        </div>

        {/* Formulario */}
        <form className="w-full space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Ingrese su usuario:
            </label>
            <input 
              type="text" 
              placeholder="Usuario" 
              className="input input-bordered w-full rounded-xl bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
    />
            /
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-800 mb-1">
              Ingrese su contraseña:
            </label>
            <input 
              type="password" 
              placeholder="Contraseña" 
              className="input input-bordered w-full rounded-xl bg-gray-50 focus:bg-white text-gray-800 placeholder:text-gray-400"
            />
          </div>

          <button 
            type="submit" 
            className="btn w-full bg-[#E07A00] hover:bg-[#c66c00] text-white border-none rounded-xl mt-4 font-normal"
          >
            Ingresar al sistema
          </button>
        </form>
      </div>
    </div>
  );
}