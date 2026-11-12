'use client';

import React from 'react';
import Image from 'next/image';

export const LoginBranding: React.FC = () => {
  return (
    <div className="absolute inset-0 flex overflow-hidden pointer-events-none">
      {/* Lado izquierdo azul */}
      <div className="w-1/2 bg-[#4285F4] relative flex items-center justify-start opacity-95">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 -translate-x-12">
          <Image
            src="/cubeta.png"
            alt="Cubeta PintaPro"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* Lado derecho amarillo */}
      <div className="w-1/2 bg-[#F4C430] relative flex items-center justify-end opacity-95">
        <div className="relative w-80 h-80 sm:w-96 sm:h-96 translate-x-12">
          <Image
            src="/bandeja.png"
            alt="Bandeja PintaPro"
            fill
            className="object-contain"
            priority
          />
        </div>
      </div>
    </div>
  );
};
