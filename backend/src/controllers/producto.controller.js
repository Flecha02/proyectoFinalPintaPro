const { crearProducto, obtenerProductos, obtenerProductoPorId, actualizarProducto, eliminarProducto } = require('../models/producto.model');

async function registrar(req, res) {
    try {
        const { idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto } = req.body;

        if (!idCategoria || !idMedidaPresentacion || !codigoProducto || !nombreProducto || !marcaProducto || precioVentaProducto === undefined) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios para registrar el producto.' });
        }

        if (isNaN(precioVentaProducto) || Number(precioVentaProducto) <= 0) {
            return res.status(400).json({ status: 'error', message: 'El precio de venta debe ser un número mayor a 0.' });
        }

        const idProducto = await crearProducto(
            idCategoria, 
            idMedidaPresentacion, 
            codigoProducto.trim(), 
            nombreProducto.trim(), 
            marcaProducto.trim(), 
            colorProducto ? colorProducto.trim() : null, 
            Number(precioVentaProducto)
        );

        res.status(201).json({
            status: 'success',
            message: 'Producto registrado correctamente',
            data: { idProducto }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe un producto registrado con este código.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function listar(req, res) {
    try {
        const productos = await obtenerProductos();
        res.json({ status: 'success', data: productos });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const producto = await obtenerProductoPorId(id);

        if (!producto) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado.' });
        }

        res.json({ status: 'success', data: producto });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto } = req.body;

        if (!idCategoria || !idMedidaPresentacion || !codigoProducto || !nombreProducto || !marcaProducto || precioVentaProducto === undefined) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios para actualizar el producto.' });
        }

        if (isNaN(precioVentaProducto) || Number(precioVentaProducto) <= 0) {
            return res.status(400).json({ status: 'error', message: 'El precio de venta debe ser un número mayor a 0.' });
        }

        const filasAfectadas = await actualizarProducto(
            id, 
            idCategoria, 
            idMedidaPresentacion, 
            codigoProducto.trim(), 
            nombreProducto.trim(), 
            marcaProducto.trim(), 
            colorProducto ? colorProducto.trim() : null, 
            Number(precioVentaProducto)
        );

        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado para actualizar.' });
        }

        res.json({ status: 'success', message: 'Producto actualizado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe otro producto con este código.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function eliminar(req, res) {
    try {
        const { id } = req.params;
        const filasAfectadas = await eliminarProducto(id);

        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Producto no encontrado para eliminar.' });
        }

        res.json({ status: 'success', message: 'Producto eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    registrar,
    listar,
    buscarPorId,
    actualizar,
    eliminar
};