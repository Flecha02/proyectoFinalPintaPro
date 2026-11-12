'use client';

import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'info' | 'success' | 'warning' | 'danger' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
  };

  const variantClasses = {
    info: 'bg-blue-50 text-blue-700 ring-1 ring-blue-700/10',
    success: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-700/10',
    warning: 'bg-amber-50 text-amber-800 ring-1 ring-amber-700/10',
    danger: 'bg-red-50 text-red-700 ring-1 ring-red-700/10',
    neutral: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/10',
  };

  return (
    <span className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  );
};
