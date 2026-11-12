'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { RoleGuard } from '../../components/layout/RoleGuard';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Alert } from '../../components/ui/Alert';
import { ProductFilters } from '../../components/features/productos/ProductFilters';
import { ProductTable } from '../../components/features/productos/ProductTable';
import { ProductModal } from '../../components/features/productos/ProductModal';
import { Categoria, MedidaPresentacion, Producto } from '../../lib/types';
import {
  actualizarProducto,
  crearProducto,
  eliminarProducto as eliminarProductoApi,
  listarCategorias,
  listarMedidas,
  listarProductos,
} from '../../lib/api';
import { useToast } from '../../context/ToastContext';

export default function ProductosPage() {
  const router = useRouter();
  const { mostrarExito, mostrarError } = useToast();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [medidas, setMedidas] = useState<MedidaPresentacion[]>([]);
  const [cargando, setCargando] = useState(true);

  const [busqueda, setBusqueda] = useState('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('Todos');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoSeleccionado, setProductoSeleccionado] = useState<Producto | null>(null);

  const [alerta, setAlerta] = useState<{ tipo: 'success' | 'error'; mensaje: string } | null>(null);

  const cargarDatos = async () => {
    setCargando(true);
    try {
      const [resCat, resMed, resProd] = await Promise.all([
        listarCategorias(),
        listarMedidas(),
        listarProductos(),
      ]);

      if (resCat?.data) setCategorias(resCat.data);
      if (resMed?.data) setMedidas(resMed.data);
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
    } catch (err) {
      setAlerta({
        tipo: 'error',
        mensaje: err instanceof Error ? err.message : 'Error al cargar los productos de la API',
      });
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleGuardarProducto = async (prodData: {
    idProducto?: number;
    codigoProducto: string;
    nombreProducto: string;
    idCategoria: number;
    marcaProducto: string;
    colorProducto: string;
    idMedidaPresentacion: number;
    precioVentaProducto: number;
  }) => {
    try {
      if (prodData.idProducto) {
        await actualizarProducto(prodData.idProducto, prodData);
        const msg = 'Producto actualizado exitosamente.';
        setAlerta({ tipo: 'success', mensaje: msg });
        mostrarExito(msg, 'Producto Actualizado');
      } else {
        await crearProducto(prodData);
        const msg = 'Producto creado exitosamente.';
        setAlerta({ tipo: 'success', mensaje: msg });
        mostrarExito(msg, 'Producto Registrado');
      }
      await cargarDatos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el producto.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Fallo al Guardar');
    }
  };

  const handleEliminarProducto = async (prod: Producto) => {
    if (!window.confirm(`¿Estás seguro de eliminar el producto "${prod.nombreProducto}" (${prod.codigoProducto})?`)) {
      return;
    }
    try {
      await eliminarProductoApi(prod.idProducto);
      const msg = `Producto "${prod.nombreProducto}" eliminado correctamente.`;
      setAlerta({ tipo: 'success', mensaje: msg });
      mostrarExito(msg, 'Producto Eliminado');
      await cargarDatos();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'No se pudo eliminar el producto.';
      setAlerta({ tipo: 'error', mensaje: msg });
      mostrarError(msg, 'Error al Eliminar');
    }
  };

  const productosFiltrados = productos.filter((p) => {
    const coincideCat =
      categoriaSeleccionada === 'Todos' || p.nombreCategoria === categoriaSeleccionada;
    const q = busqueda.toLowerCase();
    const coincideBusqueda =
      p.nombreProducto.toLowerCase().includes(q) ||
      p.codigoProducto.toLowerCase().includes(q) ||
      p.marcaProducto.toLowerCase().includes(q);
    return coincideCat && coincideBusqueda;
  });

  return (
    <RoleGuard allowedRoles={['DIGITADOR', 'GERENTE', 'ADMIN', 'ADMINISTRADOR']}>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-6">
        <PageHeader
          title="Gestión de Productos"
          description="Administra el catálogo oficial de pinturas, solventes, barnices y accesorios."
          actions={
            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                onClick={() => router.push('/compras')}
                icono={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                }
              >
                Compras y Bodega
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setProductoSeleccionado(null);
                  setModalAbierto(true);
                }}
                icono={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                  </svg>
                }
              >
                Nuevo Producto
              </Button>
            </div>
          }
        />

        {alerta && (
          <Alert
            tipo={alerta.tipo}
            mensaje={alerta.mensaje}
            onDismiss={() => setAlerta(null)}
          />
        )}

        <ProductFilters
          busqueda={busqueda}
          onBusquedaChange={setBusqueda}
          categoriaSeleccionada={categoriaSeleccionada}
          onCategoriaChange={setCategoriaSeleccionada}
          categorias={categorias.map((c) => c.nombreCategoria)}
        />

        <ProductTable
          productos={productosFiltrados}
          cargando={cargando}
          onEditar={(p) => {
            setProductoSeleccionado(p);
            setModalAbierto(true);
          }}
          onEliminar={handleEliminarProducto}
        />

        <ProductModal
          isOpen={modalAbierto}
          onClose={() => setModalAbierto(false)}
          productoEditar={productoSeleccionado}
          categorias={categorias}
          medidas={medidas}
          onGuardar={handleGuardarProducto}
        />
      </main>
    </RoleGuard>
  );
}
