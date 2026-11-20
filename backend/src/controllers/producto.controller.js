const { crearProducto, obtenerProductos, obtenerProductoPorId, actualizarProducto, eliminarProducto } = require('../models/producto.model');
const {
    MENSAJES,
    normalizarTexto,
    esNombreProducto,
    esCodigoProducto,
    esPrecioDecimal
} = require('../utils/validators');

// El color puede ser "N/A" (sin color aplicable) además del formato de nombre permitido.
function validarColor(colorProducto) {
    const color = normalizarTexto(colorProducto);
    if (color === '') return true;
    if (color.toUpperCase() === 'N/A') return true;
    return esNombreProducto(color);
}

function validarProducto(codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto) {
    if (!esCodigoProducto(codigoProducto)) {
        return MENSAJES.CODIGO_PRODUCTO;
    }
    if (!esNombreProducto(nombreProducto)) {
        return `Nombre del producto: ${MENSAJES.NOMBRE_PRODUCTO}`;
    }
    if (!esNombreProducto(marcaProducto)) {
        return `Marca: ${MENSAJES.NOMBRE_PRODUCTO}`;
    }
    if (!validarColor(colorProducto)) {
        return `Color: ${MENSAJES.NOMBRE_PRODUCTO}`;
    }
    if (!esPrecioDecimal(precioVentaProducto)) {
        return MENSAJES.PRECIO_DECIMAL;
    }
    return null;
}

async function registrar(req, res) {
    try {
        const { idCategoria, idMedidaPresentacion, codigoProducto, nombreProducto, marcaProducto, colorProducto, precioVentaProducto } = req.body;

        if (!idCategoria || !idMedidaPresentacion || !codigoProducto || !nombreProducto || !marcaProducto || precioVentaProducto === undefined) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios para registrar el producto.' });
        }

        const errorValidacion = validarProducto(
            codigoProducto,
            nombreProducto,
            marcaProducto,
            colorProducto,
            precioVentaProducto
        );
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const colorNormalizado = normalizarTexto(colorProducto);

        const idProducto = await crearProducto(
            idCategoria, 
            idMedidaPresentacion, 
            normalizarTexto(codigoProducto), 
            normalizarTexto(nombreProducto), 
            normalizarTexto(marcaProducto), 
            colorNormalizado ? colorNormalizado : null, 
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

        const errorValidacion = validarProducto(
            codigoProducto,
            nombreProducto,
            marcaProducto,
            colorProducto,
            precioVentaProducto
        );
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const colorNormalizado = normalizarTexto(colorProducto);

        const filasAfectadas = await actualizarProducto(
            id, 
            idCategoria, 
            idMedidaPresentacion, 
            normalizarTexto(codigoProducto), 
            normalizarTexto(nombreProducto), 
            normalizarTexto(marcaProducto), 
            colorNormalizado ? colorNormalizado : null, 
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
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({
                status: 'error',
                message: 'No es posible eliminar el producto porque está vinculado a registros históricos del sistema (facturas, compras o inventario).'
            });
        }
        res.status(400).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    registrar,
    listar,
    buscarPorId,
    actualizar,
    eliminar
};
