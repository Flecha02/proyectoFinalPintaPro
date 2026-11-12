'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

export type TipoToast = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  tipo: TipoToast;
  titulo?: string;
  mensaje: string;
  duracion?: number;
}

export interface ToastContextType {
  mostrarToast: (tipo: TipoToast, mensaje: string, titulo?: string, duracion?: number) => void;
  mostrarExito: (mensaje: string, titulo?: string) => void;
  mostrarError: (mensaje: string, titulo?: string) => void;
  mostrarAdvertencia: (mensaje: string, titulo?: string) => void;
  mostrarInfo: (mensaje: string, titulo?: string) => void;
  cerrarToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const cerrarToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const mostrarToast = useCallback(
    (tipo: TipoToast, mensaje: string, titulo?: string, duracion = 3500) => {
      const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const nuevoToast: ToastItem = {
        id,
        tipo,
        titulo,
        mensaje,
        duracion,
      };

      // Si ya hay uno mostrándose, reemplazamos con el más reciente para que no se sobrepongan en el centro
      setToasts([nuevoToast]);

      if (duracion > 0) {
        setTimeout(() => {
          cerrarToast(id);
        }, duracion);
      }
    },
    [cerrarToast],
  );

  const mostrarExito = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarToast('success', mensaje, titulo || '¡Acción Exitosa!');
    },
    [mostrarToast],
  );

  const mostrarError = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarToast('error', mensaje, titulo || '¡Ocurrió un Error!');
    },
    [mostrarToast],
  );

  const mostrarAdvertencia = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarToast('warning', mensaje, titulo || '¡Advertencia!');
    },
    [mostrarToast],
  );

  const mostrarInfo = useCallback(
    (mensaje: string, titulo?: string) => {
      mostrarToast('info', mensaje, titulo || 'Información');
    },
    [mostrarToast],
  );

  return (
    <ToastContext.Provider
      value={{
        mostrarToast,
        mostrarExito,
        mostrarError,
        mostrarAdvertencia,
        mostrarInfo,
        cerrarToast,
      }}
    >
      {children}

      {/* Pop-up destacado y centrado en medio de la pantalla */}
      {toasts.length > 0 && (
        <div
          role="region"
          aria-live="assertive"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
        >
          {toasts.map((toast) => {
            const esExito = toast.tipo === 'success';
            const esError = toast.tipo === 'error';
            const esWarn = toast.tipo === 'warning';

            return (
              <div
                key={toast.id}
                role={esError ? 'alert' : 'status'}
                className="relative bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 sm:p-7 max-w-sm sm:max-w-md w-full text-center flex flex-col items-center transition-all transform animate-in zoom-in-95 duration-200"
              >
                {/* Botón de cierre en la esquina */}
                <button
                  type="button"
                  onClick={() => cerrarToast(toast.id)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-xl hover:bg-gray-100 transition-colors focus:outline-none"
                  title="Cerrar ventana"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Icono central de gran impacto */}
                <div className="mb-4">
                  {esExito && (
                    <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center ring-8 ring-emerald-50 shadow-inner">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {esError && (
                    <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center ring-8 ring-red-50 shadow-inner">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                  )}
                  {esWarn && (
                    <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center ring-8 ring-amber-50 shadow-inner">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                  )}
                  {!esExito && !esError && !esWarn && (
                    <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center ring-8 ring-blue-50 shadow-inner">
                      <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Título y Mensaje */}
                <h3 className="text-xl font-black text-gray-900 tracking-tight">
                  {toast.titulo}
                </h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-sm">
                  {toast.mensaje}
                </p>

                {/* Botón de acción */}
                <div className="mt-6 w-full">
                  <button
                    type="button"
                    onClick={() => cerrarToast(toast.id)}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 shadow-sm cursor-pointer ${
                      esExito
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-2 focus:ring-emerald-500/50'
                        : esError
                        ? 'bg-red-600 hover:bg-red-700 text-white focus:ring-2 focus:ring-red-500/50'
                        : esWarn
                        ? 'bg-amber-600 hover:bg-amber-700 text-white focus:ring-2 focus:ring-amber-500/50'
                        : 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-2 focus:ring-blue-500/50'
                    }`}
                  >
                    Entendido
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe ser utilizado dentro de un ToastProvider');
  }
  return context;
};
