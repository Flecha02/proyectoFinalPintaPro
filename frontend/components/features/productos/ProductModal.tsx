'use client';

import React, { useEffect, useState } from 'react';
import { Categoria, MedidaPresentacion, Producto } from '../../../lib/types';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';
import {
  MENSAJES,
  esCodigoProducto,
  esNombreProducto,
  esPrecioDecimal,
  normalizarTexto,
} from '../../../lib/validators';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoEditar?: Producto | null;
  categorias: Categoria[];
  medidas: MedidaPresentacion[];
  onGuardar: (prod: {
    idProducto?: number;
    codigoProducto: string;
    nombreProducto: string;
    idCategoria: number;
    marcaProducto: string;
    colorProducto: string;
    idMedidaPresentacion: number;
    precioVentaProducto: number;
  }) => Promise<void>;
}

interface ErroresProducto {
  codigo?: string;
  nombre?: string;
  idCategoria?: string;
  marca?: string;
  color?: string;
  idMedida?: string;
  precio?: string;
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  productoEditar,
  categorias,
  medidas,
  onGuardar,
}) => {
  const [codigo, setCodigo] = useState('');
  const [nombre, setNombre] = useState('');
  const [idCategoria, setIdCategoria] = useState<number | ''>('');
  const [marca, setMarca] = useState('');
  const [color, setColor] = useState('');
  const [idMedida, setIdMedida] = useState<number | ''>('');
  const [precio, setPrecio] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [errores, setErrores] = useState<ErroresProducto>({});

  useEffect(() => {
    if (productoEditar) {
      setCodigo(productoEditar.codigoProducto);
      setNombre(productoEditar.nombreProducto);
      setMarca(productoEditar.marcaProducto);
      setColor(productoEditar.colorProducto || '');
      setPrecio(String(productoEditar.precioVentaProducto));
      
      const cat = categorias.find((c) => c.nombreCategoria === productoEditar.nombreCategoria);
      setIdCategoria(cat ? cat.idCategoria : productoEditar.idCategoria || '');

      const med = medidas.find((m) => m.descripcionMedida === productoEditar.descripcionMedida);
      setIdMedida(med ? med.idMedidaPresentacion : productoEditar.idMedidaPresentacion || '');
    } else {
      setCodigo('');
      setNombre('');
      setIdCategoria(categorias[0]?.idCategoria || '');
      setMarca('');
      setColor('');
      setIdMedida(medidas[0]?.idMedidaPresentacion || '');
      setPrecio('');
    }
    setError('');
    setErrores({});
  }, [productoEditar, isOpen, categorias, medidas]);

  // Reglas de negocio según categoría
  const categoriaSeleccionadaNombre = categorias.find((c) => c.idCategoria === Number(idCategoria))?.nombreCategoria;
  const esAccesorio = categoriaSeleccionadaNombre === 'Accesorios';
  const esBarnizOSolvente = categoriaSeleccionadaNombre === 'Barnices' || categoriaSeleccionadaNombre === 'Solventes';
  const colorNoAplica = esAccesorio || esBarnizOSolvente;

  const handleCategoriaChange = (nuevaId: number) => {
    setIdCategoria(nuevaId);
    setErrores((prev) => ({ ...prev, idCategoria: undefined }));
    const cat = categorias.find((c) => c.idCategoria === nuevaId);
    if (cat?.nombreCategoria === 'Accesorios') {
      setColor('N/A');
    } else if (cat?.nombreCategoria === 'Barnices' || cat?.nombreCategoria === 'Solventes') {
      setColor('N/A');
    } else if (color === 'N/A') {
      setColor('');
    }
  };

  const validar = (): ErroresProducto => {
    const nuevosErrores: ErroresProducto = {};
    const codigoNormalizado = normalizarTexto(codigo);
    const nombreNormalizado = normalizarTexto(nombre);
    const marcaNormalizada = normalizarTexto(marca);
    const colorNormalizado = normalizarTexto(color);

    if (!idCategoria) {
      nuevosErrores.idCategoria = 'Debes seleccionar una categoría.';
    }
    if (!idMedida) {
      nuevosErrores.idMedida = 'Debes seleccionar una presentación.';
    }
    if (!esCodigoProducto(codigoNormalizado)) {
      nuevosErrores.codigo = MENSAJES.CODIGO_PRODUCTO;
    }
    if (!esNombreProducto(nombreNormalizado)) {
      nuevosErrores.nombre = MENSAJES.NOMBRE_PRODUCTO;
    }
    if (!esNombreProducto(marcaNormalizada)) {
      nuevosErrores.marca = MENSAJES.NOMBRE_PRODUCTO;
    }
    if (!colorNoAplica && colorNormalizado !== '' && colorNormalizado.toUpperCase() !== 'N/A' && !esNombreProducto(colorNormalizado)) {
      nuevosErrores.color = MENSAJES.NOMBRE_PRODUCTO;
    }
    if (!esPrecioDecimal(precio)) {
      nuevosErrores.precio = MENSAJES.PRECIO_DECIMAL;
    }

    return nuevosErrores;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const nuevosErrores = validar();
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    setCargando(true);
    try {
      await onGuardar({
        idProducto: productoEditar?.idProducto,
        codigoProducto: normalizarTexto(codigo),
        nombreProducto: normalizarTexto(nombre),
        idCategoria: Number(idCategoria),
        marcaProducto: normalizarTexto(marca),
        colorProducto: colorNoAplica ? 'N/A' : (normalizarTexto(color) || 'N/A'),
        idMedidaPresentacion: Number(idMedida),
        precioVentaProducto: Number(precio),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={productoEditar ? 'Editar Producto' : 'Nuevo Producto'}
      description="Completa los datos del producto para el catálogo oficial."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-semibold" role="alert">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Código del Producto"
            required
            placeholder="ej. PINT-VIN-001"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setErrores((prev) => ({ ...prev, codigo: undefined }));
            }}
            error={errores.codigo}
            helperText="Solo alfanumérico y guiones (3 a 20 caracteres)."
          />

          <Select
            label="Categoría"
            required
            value={idCategoria}
            onChange={(e) => handleCategoriaChange(Number(e.target.value))}
            options={categorias.map((c) => ({
              value: c.idCategoria,
              label: c.nombreCategoria,
            }))}
            error={errores.idCategoria}
          />
        </div>

        <Input
          label="Nombre del Producto"
          required
          placeholder="ej. Pintura Acrílica Vinil Mate"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value);
            setErrores((prev) => ({ ...prev, nombre: undefined }));
          }}
          error={errores.nombre}
          helperText="Solo letras, tildes, ñ y espacios (2 a 100 caracteres)."
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Marca"
            required
            placeholder="ej. PintaPro, Truper, Celco"
            value={marca}
            onChange={(e) => {
              setMarca(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''));
              setErrores((prev) => ({ ...prev, marca: undefined }));
            }}
            error={errores.marca}
            helperText="Solo se permiten letras y espacios"
          />

          <Input
            label="Color"
            disabled={colorNoAplica}
            placeholder={colorNoAplica ? 'No aplica' : 'ej. Blanco, Rojo Óxido'}
            value={colorNoAplica ? 'N/A' : color}
            onChange={(e) => {
              setColor(e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, ''));
              setErrores((prev) => ({ ...prev, color: undefined }));
            }}
            error={errores.color}
            helperText={colorNoAplica ? 'Fijado en N/A para esta categoría' : 'Solo se permiten letras y espacios'}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Presentación / Medida"
            required
            value={idMedida}
            onChange={(e) => {
              setIdMedida(Number(e.target.value));
              setErrores((prev) => ({ ...prev, idMedida: undefined }));
            }}
            options={medidas.map((m) => ({
              value: m.idMedidaPresentacion,
              label: m.descripcionMedida,
            }))}
            error={errores.idMedida}
          />

          <Input
            label="Precio de Venta (Q)"
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={precio}
            onChange={(e) => {
              setPrecio(e.target.value);
              setErrores((prev) => ({ ...prev, precio: undefined }));
            }}
            error={errores.precio}
            helperText="Monto decimal mayor a 0 (máximo 2 decimales)."
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={cargando}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" cargando={cargando}>
            {productoEditar ? 'Actualizar Producto' : 'Guardar Producto'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
