'use client';

import React from 'react';

export interface TabOption {
  id: number;
  label: string;
  badge?: string;
  icon?: string;
}

export interface ReportTabsNavProps {
  activo: number;
  onSelect: (id: number) => void;
}

export const ReportTabsNav: React.FC<ReportTabsNavProps> = ({ activo, onSelect }) => {
  const tabs: TabOption[] = [
    { id: 1, label: '1. Ventas por Medio de Pago', icon: '💳' },
    { id: 2, label: '2. Top Ingresos', icon: '💰' },
    { id: 3, label: '3. Más Vendidos', icon: '📈' },
    { id: 4, label: '4. Inventario Actual', icon: '📦' },
    { id: 5, label: '5. Menos Vendidos', icon: '📉' },
    { id: 6, label: '6. Productos Agotados', icon: '⚠️' },
    { id: 7, label: '7. Consultar Factura', icon: '🧾' },
  ];

  return (
    <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-xs overflow-x-auto">
      <div className="flex items-center gap-1.5 min-w-max">
        {tabs.map((tab) => {
          const isSelected = activo === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelect(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#1e3a8a] text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
