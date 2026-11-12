'use client';

import React, { useEffect, useState } from 'react';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { PageHeader } from '../../components/layout/PageHeader';
import { ReportTabsNav } from '../../components/features/admin/ReportTabsNav';
import { ReportDateFilter } from '../../components/features/admin/ReportDateFilter';
import { ReporteVentasMedioPago } from '../../components/features/admin/ReporteVentasMedioPago';
import { ReporteProductosIngresos } from '../../components/features/admin/ReporteProductosIngresos';
import { ReporteProductosVendidos } from '../../components/features/admin/ReporteProductosVendidos';
import { ReporteInventarioActual } from '../../components/features/admin/ReporteInventarioActual';
import { ReporteMenosVendidos } from '../../components/features/admin/ReporteMenosVendidos';
import { ReporteProductosAgotados } from '../../components/features/admin/ReporteProductosAgotados';
import { ReporteBuscarFactura } from '../../components/features/admin/ReporteBuscarFactura';
import {
  obtenerReporteInventarioActual,
  obtenerReporteProductosAgotados,
  obtenerReporteProductosMasIngresos,
  obtenerReporteProductosMasVendidos,
  obtenerReporteProductosMenosVendidos,
  obtenerReporteVentasPorMedioPago,
} from '../../lib/api';

export default function AdminPage() {
  const [tabActivo, setTabActivo] = useState<number>(1);
  const [fechaInicio, setFechaInicio] = useState('2026-10-01');
  const [fechaFin, setFechaFin] = useState('2026-11-30');
  const [cargando, setCargando] = useState(false);

  // Estados de los datos de reportes
  const [reporte1, setReporte1] = useState<{ totalGeneral: number; desglose: Array<{ nombreMedioPago: string; totalMonto: number | string }> }>({
    totalGeneral: 0,
    desglose: [],
  });
  const [reporte2, setReporte2] = useState<Array<{ nombreProducto: string; totalGenerado: number | string }>>([]);
  const [reporte3, setReporte3] = useState<Array<{ nombreProducto: string; descripcionMedida: string; cantidadTotalVendida: number | string }>>([]);
  const [reporte4, setReporte4] = useState<any[]>([]);
  const [reporte5, setReporte5] = useState<Array<{ nombreProducto: string; totalVendido: number | string }>>([]);
  const [reporte6, setReporte6] = useState<any[]>([]);

  const cargarReporte = async () => {
    setCargando(true);
    try {
      if (tabActivo === 1) {
        const resp = await obtenerReporteVentasPorMedioPago(fechaInicio, fechaFin);
        setReporte1(resp.data);
      } else if (tabActivo === 2) {
        const resp = await obtenerReporteProductosMasIngresos(fechaInicio, fechaFin);
        setReporte2(resp.data);
      } else if (tabActivo === 3) {
        const resp = await obtenerReporteProductosMasVendidos(fechaInicio, fechaFin);
        setReporte3(resp.data);
      } else if (tabActivo === 4) {
        const resp = await obtenerReporteInventarioActual();
        setReporte4(resp.data);
      } else if (tabActivo === 5) {
        const resp = await obtenerReporteProductosMenosVendidos();
        setReporte5(resp.data);
      } else if (tabActivo === 6) {
        const resp = await obtenerReporteProductosAgotados();
        setReporte6(resp.data);
      }
    } catch (err) {
      console.error('Error al cargar reporte:', err);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarReporte();
  }, [tabActivo]);

  const requiereFiltroFechas = tabActivo === 1 || tabActivo === 2 || tabActivo === 3;

  return (
    <RoleGuard allowedRoles={['GERENTE', 'ADMIN', 'ADMINISTRADOR']}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <PageHeader
          title="Panel de Reportes y Auditoría"
          description="Monitoreo financiero, control de inventario y estadísticas de ventas de PintaPro."
        />

        <ReportTabsNav activo={tabActivo} onSelect={setTabActivo} />

        {requiereFiltroFechas && (
          <ReportDateFilter
            fechaInicio={fechaInicio}
            fechaFin={fechaFin}
            onFechaInicioChange={setFechaInicio}
            onFechaFinChange={setFechaFin}
            onConsultar={cargarReporte}
            cargando={cargando}
          />
        )}

        <div className="pt-2">
          {tabActivo === 1 && (
            <ReporteVentasMedioPago
              cargando={cargando}
              totalGeneral={reporte1.totalGeneral}
              desglose={reporte1.desglose}
            />
          )}

          {tabActivo === 2 && (
            <ReporteProductosIngresos
              cargando={cargando}
              productos={reporte2}
            />
          )}

          {tabActivo === 3 && (
            <ReporteProductosVendidos
              cargando={cargando}
              productos={reporte3}
            />
          )}

          {tabActivo === 4 && (
            <ReporteInventarioActual
              cargando={cargando}
              inventario={reporte4}
            />
          )}

          {tabActivo === 5 && (
            <ReporteMenosVendidos
              cargando={cargando}
              productos={reporte5}
            />
          )}

          {tabActivo === 6 && (
            <ReporteProductosAgotados
              cargando={cargando}
              productos={reporte6}
            />
          )}

          {tabActivo === 7 && <ReporteBuscarFactura />}
        </div>
      </main>
    </RoleGuard>
  );
}
