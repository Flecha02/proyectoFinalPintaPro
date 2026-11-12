'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ProveedoresSection } from '../../components/features/compras/ProveedoresSection';
import { OrdenCompraForm } from '../../components/features/compras/OrdenCompraForm';
import { OrdenesCompraList } from '../../components/features/compras/OrdenesCompraList';
import { ModalIngresoBodega } from '../../components/features/compras/ModalIngresoBodega';
import { useAuth } from '../../context/AuthContext';
import { OrdenCompra, Producto, Proveedor, UbicacionBodega } from '../../lib/types';
import {
  listarOrdenesCompra,
  listarProductos,
  listarProveedores,
  listarUbicacionesBodega,
  obtenerOrdenCompra,
  registrarIngresoBodega,
  registrarOrdenCompra,
  registrarProveedor,
} from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ComprasPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { mostrarExito, mostrarError } = useToast();

  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([]);
  const [ubicaciones, setUbicaciones] = useState<UbicacionBodega[]>([]);
  const [cargando, setCargando] = useState(true);

  const [ordenParaIngreso, setOrdenParaIngreso] = useState<OrdenCompra | null>(null);
  const [modalIngresoAbierto, setModalIngresoAbierto] = useState(false);

  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resProv, resProd, resOrd, resUbic] = await Promise.all([
        listarProveedores(),
        listarProductos(),
        listarOrdenesCompra(),
        listarUbicacionesBodega(),
      ]);

      if (resProv?.data) setProveedores(resProv.data);
      if (resProd?.data) {
        setProductos(
          resProd.data.map((p) => ({
            idProducto: p.idProducto,
            codigoProducto: p.codigoProducto,
            nombreProducto: p.nombreProducto,
            nombreCategoria: p.nombreCategoria || 'General',
            marcaProducto: p.marcaProducto || 'PintaPro',
            colorProducto: p.colorProducto || 'N/A',
            descripcionMedida: p.descripcionMedida || 'Unidad',
            precioVentaProducto: Number(p.precioVentaProducto || 0),
          }))
        );
      }
      if (resOrd?.data) {
        setOrdenes(
          resOrd.data.map((o) => ({
            idOrdenCompra: o.idOrdenCompra,
            idProveedor: o.idProveedor,
            nombreProveedor: o.nombreProveedor,
            nitProveedor: o.nitProveedor,
            idUsuario: o.idUsuario,
            nombreUsuario: o.nombreUsuario,
            fechaOrdenCompra: o.fechaOrdenCompra,
            estadoOrdenCompra: o.estadoOrdenCompra,
            totalSolicitado: Number(o.totalSolicitado || 0),
            totalRecibido: Number(o.totalRecibido || 0),
          }))
        );
      }
      if (resUbic?.data) setUbicaciones(resUbic.data);
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Error al cargar los datos de compras.',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleCrearProveedor = async (nuevoProv: {
    nitProveedor: string;
    nombreProveedor: string;
    telefonoProveedor: string;
    direccionProveedor: string;
  }) => {
    try {
      await registrarProveedor(nuevoProv);
      const msg = `Proveedor "${nuevoProv.nombreProveedor}" registrado exitosamente.`;
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Proveedor Registrado');
      await cargarDatos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar proveedor.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Error en Proveedor');
    }
  };

  const handleCrearOrden = async (nuevaOrden: {
    idProveedor: number;
    detalles: Array<{
      idProducto: number;
      cantidadSolicitada: number;
      precioAcordado: number;
    }>;
  }) => {
    if (!user?.idUsuario) return;
    try {
      await registrarOrdenCompra({
        idProveedor: nuevaOrden.idProveedor,
        idUsuario: user.idUsuario,
        detalles: nuevaOrden.detalles,
      });
      const msg = 'Orden de compra emitida correctamente.';
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Orden Registrada');
      await cargarDatos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar orden de compra.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Fallo en Orden de Compra');
    }
  };

  const handleAbrirIngreso = async (orden: OrdenCompra) => {
    try {
      const resp = await obtenerOrdenCompra(orden.idOrdenCompra);
      setOrdenParaIngreso({
        ...orden,
        detalles: (resp.data.detalles || []).map((d) => ({
          idDetalleOrdenCompra: d.idDetalleOrdenCompra,
          idOrdenCompra: orden.idOrdenCompra,
          idProducto: d.idProducto,
          nombreProducto: d.nombreProducto,
          codigoProducto: d.codigoProducto,
          cantidadSolicitada: Number(d.cantidadSolicitada),
          precioAcordado: Number(d.precioAcordado),
          cantidadYaRecibida: Number(d.cantidadYaRecibida || 0),
          cantidadPendiente: Number(
            d.cantidadPendiente !== undefined
              ? d.cantidadPendiente
              : Math.max(0, Number(d.cantidadSolicitada) - Number(d.cantidadYaRecibida || 0))
          ),
        })),
      });
      setModalIngresoAbierto(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el detalle de la orden.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg);
    }
  };

  const handleConfirmarIngreso = async (datos: {
    idOrdenCompra: number;
    numeroDocumentoEntrega?: string;
    lotesIngreso: Array<{
      idProducto: number;
      idUbicacionBodega: number;
      codigoLote: string;
      cantidadRecibida: number;
      costoUnitario: number;
    }>;
  }) => {
    if (!user?.idUsuario) return;
    try {
      await registrarIngresoBodega({
        idOrdenCompra: datos.idOrdenCompra,
        idUsuario: user.idUsuario,
        numeroDocumentoEntrega: datos.numeroDocumentoEntrega,
        lotesIngreso: datos.lotesIngreso,
      });
      const msg = 'Ingreso a bodega registrado y stock actualizado con éxito.';
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Recepción Completada');
      await cargarDatos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al registrar el ingreso a bodega.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Fallo en Ingreso');
    }
  };

  return (
    <RoleGuard allowedRoles={['DIGITADOR', 'GERENTE', 'ADMIN', 'ADMINISTRADOR']}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <PageHeader
          title="Compras e Ingreso a Bodega"
          description="Gestiona proveedores, emite órdenes de compra y recibe lotes en inventario."
          actions={
            <Button
              variant="outline"
              onClick={() => router.push('/productos')}
              icono={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              }
            >
              Catálogo de Productos
            </Button>
          }
        />

        {alerta && (
          <Alert
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            onDismiss={() => setAlerta(null)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <ProveedoresSection
              proveedores={proveedores}
              onCrearProveedor={handleCrearProveedor}
            />
          </div>
          <div className="lg:col-span-2">
            <OrdenCompraForm
              proveedores={proveedores}
              productos={productos}
              onCrearOrden={handleCrearOrden}
            />
          </div>
        </div>

        <OrdenesCompraList
          ordenes={ordenes}
          cargando={cargando}
          onRegistrarIngreso={handleAbrirIngreso}
        />

        <ModalIngresoBodega
          isOpen={modalIngresoAbierto}
          onClose={() => setModalIngresoAbierto(false)}
          orden={ordenParaIngreso}
          ubicaciones={ubicaciones}
          onConfirmarIngreso={handleConfirmarIngreso}
        />
      </main>
    </RoleGuard>
  );
}
