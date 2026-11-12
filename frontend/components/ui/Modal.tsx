'use client';

import React, { useEffect, useRef } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
  closeOnClickOutside?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'lg',
  closeOnClickOutside = false,
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = React.useId();
  const descId = React.useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isOpen]);

  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleClickBackdrop = (e: React.MouseEvent<HTMLDialogElement>) => {
    // Si closeOnClickOutside es false, no cerrar por clics accidentales en el fondo o selects
    if (!closeOnClickOutside) return;

    const dialog = dialogRef.current;
    if (!dialog) return;
    const rect = dialog.getBoundingClientRect();
    const isInDialog =
      rect.top <= e.clientY &&
      e.clientY <= rect.top + rect.height &&
      rect.left <= e.clientX &&
      e.clientX <= rect.left + rect.width;

    if (!isInDialog) {
      onClose();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl',
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={handleCancel}
      onClick={handleClickBackdrop}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={`fixed inset-0 m-auto p-0 bg-transparent backdrop:bg-black/50 backdrop:backdrop-blur-xs overscroll-contain rounded-3xl shadow-2xl w-[calc(100%-2rem)] ${maxWidthClasses[maxWidth]} transition-all`}
    >
      <div className="bg-white rounded-3xl border border-gray-100 p-6 sm:p-8 flex flex-col max-h-[90vh]">
        <div className="no-print flex items-start justify-between gap-4 pb-4 border-b border-gray-100">
          <div>
            <h2 id={titleId} className="text-xl font-bold text-gray-900 tracking-tight">
              {title}
            </h2>
            {description && (
              <p id={descId} className="text-xs text-gray-500 mt-1">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-xl transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain py-4 flex-1">
          {children}
        </div>
      </div>
    </dialog>
  );
};
