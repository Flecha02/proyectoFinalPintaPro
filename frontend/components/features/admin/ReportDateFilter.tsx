'use client';

import React, { useState } from 'react';
import { Input } from '../../ui/Input';
import { Button } from '../../ui/Button';
import { MENSAJES, esFechaISO, esRangoFechasValido } from '../../../lib/validators';

export interface ReportDateFilterProps {
  fechaInicio: string;
  fechaFin: string;
  onFechaInicioChange: (val: string) => void;
  onFechaFinChange: (val: string) => void;
  onConsultar: () => void;
  cargando?: boolean;
}

export const ReportDateFilter: React.FC<ReportDateFilterProps> = ({
  fechaInicio,
  fechaFin,
  onFechaInicioChange,
  onFechaFinChange,
  onConsultar,
  cargando = false,
}) => {
  const [errores, setErrores] = useState<{ fechaInicio?: string; fechaFin?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevosErrores: { fechaInicio?: string; fechaFin?: string } = {};

    if (!esFechaISO(fechaInicio)) {
      nuevosErrores.fechaInicio = MENSAJES.FECHA_ISO;
    }
    if (!esFechaISO(fechaFin)) {
      nuevosErrores.fechaFin = MENSAJES.FECHA_ISO;
    }
    if (!nuevosErrores.fechaInicio && !nuevosErrores.fechaFin && !esRangoFechasValido(fechaInicio, fechaFin)) {
      nuevosErrores.fechaInicio = MENSAJES.RANGO_FECHAS;
    }

    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    onConsultar();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-4 rounded-2xl border border-gray-100 shadow-xs flex flex-col sm:flex-row sm:items-end gap-3"
      noValidate
    >
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Fecha de Inicio"
          type="date"
          required
          value={fechaInicio}
          onChange={(e) => {
            onFechaInicioChange(e.target.value);
            setErrores((prev) => ({ ...prev, fechaInicio: undefined }));
          }}
          error={errores.fechaInicio}
          helperText="Formato YYYY-MM-DD."
        />
        <Input
          label="Fecha de Fin"
          type="date"
          required
          value={fechaFin}
          onChange={(e) => {
            onFechaFinChange(e.target.value);
            setErrores((prev) => ({ ...prev, fechaFin: undefined }));
          }}
          error={errores.fechaFin}
          helperText="Debe ser igual o posterior al inicio."
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        size="md"
        cargando={cargando}
        className="shrink-0"
        icono={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        }
      >
        Actualizar Reporte
      </Button>
    </form>
  );
};
