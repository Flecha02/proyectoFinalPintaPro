'use client';

import React, { useEffect, useState } from 'react';
import { Categoria, MedidaPresentacion, Producto } from '../../../lib/types';
import { Modal } from '../../ui/Modal';
import { Input } from '../../ui/Input';
import { Select } from '../../ui/Select';
import { Button } from '../../ui/Button';

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
  }, [productoEditar, isOpen, categorias, medidas]);

  // Reglas de negocio según categoría
  const categoriaSeleccionadaNombre = categorias.find((c) => c.idCategoria === Number(idCategoria))?.nombreCategoria;
  const esAccesorio = categoriaSeleccionadaNombre === 'Accesorios';
  const esBarnizOSolvente = categoriaSeleccionadaNombre === 'Barniz' || categoriaSeleccionadaNombre === 'Solventes';

  const handleCategoriaChange = (nuevaId: number) => {
    setIdCategoria(nuevaId);
    const cat = categorias.find((c) => c.idCategoria === nuevaId);
    if (cat?.nombreCategoria === 'Accesorios') {
      setColor('N/A');
    } else if (cat?.nombreCategoria === 'Barniz' || cat?.nombreCategoria === 'Solventes') {
      setColor('N/A');
    } else if (color === 'N/A') {
      setColor('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!idCategoria || !idMedida) {
      setError('Debes seleccionar categoría y presentación.');
      return;
    }
    if (Number(precio) <= 0) {
      setError('El precio debe ser un monto mayor a 0.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      await onGuardar({
        idProducto: productoEditar?.idProducto,
        codigoProducto: codigo.trim(),
        nombreProducto: nombre.trim(),
        idCategoria: Number(idCategoria),
        marcaProducto: marca.trim(),
        colorProducto: esAccesorio || esBarnizOSolvente ? 'N/A' : (color.trim() || 'N/A'),
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
      <form onSubmit={handleSubmit} className="space-y-4">
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
            onChange={(e) => setCodigo(e.target.value)}
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
          />
        </div>

        <Input
          label="Nombre del Producto"
          required
          placeholder="ej. Pintura Acrílica Vinil Mate"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Marca"
            required
            placeholder="ej. PintaPro, Truper, Celco"
            value={marca}
            onChange={(e) => setMarca(e.target.value)}
          />

          <Input
            label="Color"
            disabled={esAccesorio || esBarnizOSolvente}
            placeholder={esAccesorio || esBarnizOSolvente ? 'No aplica' : 'ej. Blanco, Rojo Óxido'}
            value={esAccesorio || esBarnizOSolvente ? 'N/A' : color}
            onChange={(e) => setColor(e.target.value)}
            helperText={esAccesorio || esBarnizOSolvente ? 'Fijado en N/A para esta categoría' : undefined}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Presentación / Medida"
            required
            value={idMedida}
            onChange={(e) => setIdMedida(Number(e.target.value))}
            options={medidas.map((m) => ({
              value: m.idMedidaPresentacion,
              label: m.descripcionMedida,
            }))}
          />

          <Input
            label="Precio de Venta (Q)"
            required
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
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
