const { crearProveedor, obtenerProveedores, obtenerProveedorPorId, actualizarProveedor, eliminarProveedor } = require('../models/proveedor.model');
const {
    MENSAJES,
    normalizarTexto,
    esNombreCliente,
    esNit,
    esTelefono
} = require('../utils/validators');

function validarDatosProveedor(nitProveedor, nombreProveedor, telefonoProveedor) {
    const nit = normalizarTexto(nitProveedor).toUpperCase();
    const nombre = normalizarTexto(nombreProveedor);
    const telefono = normalizarTexto(telefonoProveedor);

    if (!esNombreCliente(nombre)) {
        return MENSAJES.NOMBRE_CLIENTE;
    }
    if (!esNit(nit)) {
        return MENSAJES.NIT;
    }
    // El teléfono es opcional, pero si se envía debe tener el formato correcto.
    if (telefono !== '' && !esTelefono(telefono)) {
        return MENSAJES.TELEFONO;
    }
    return null;
}

async function registrar(req, res) {
    try {
        const { nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor} = req.body;

        const errorValidacion = validarDatosProveedor(nitProveedor, nombreProveedor, telefonoProveedor);
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const telefono = normalizarTexto(telefonoProveedor);
        const direccion = normalizarTexto(direccionProveedor);

        const idProveedor = await crearProveedor(
            normalizarTexto(nitProveedor).toUpperCase(), 
            normalizarTexto(nombreProveedor), 
            telefono ? telefono : null, 
            direccion ? direccion : null
        );
        res.status(201).json({
            status: 'success',
            message: 'Proveedor registrado correctamente',
            data: { idProveedor }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe un proveedor registrado con este NIT o DPI.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function listar(req, res) {
    try {
        const proveedores = await obtenerProveedores();
        res.json({ status: 'success', data: proveedores });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const proveedor = await obtenerProveedorPorId(id);
        if (!proveedor) {
            return res.status(404).json({ status: 'error', message: 'Proveedor no encontrado.' });
        }
        res.json({ status: 'success', data: proveedor });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor} = req.body;

        const errorValidacion = validarDatosProveedor(nitProveedor, nombreProveedor, telefonoProveedor);
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const telefono = normalizarTexto(telefonoProveedor);
        const direccion = normalizarTexto(direccionProveedor);

        const filasAfectadas = await actualizarProveedor(
            id, 
            normalizarTexto(nitProveedor).toUpperCase(), 
            normalizarTexto(nombreProveedor), 
            telefono ? telefono : null, 
            direccion ? direccion : null
        );
        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Proveedor no encontrado para actualizar.' });
        }
        res.json({ status: 'success', message: 'Proveedor actualizado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe otro proveedor con este NIT o DPI.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function eliminar(req, res) {
    try {
        const { id } = req.params;
        const filasAfectadas = await eliminarProveedor(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Proveedor no encontrado para eliminar.' });
        }
        res.json({ status: 'success', message: 'Proveedor eliminado correctamente' });
    } catch (error) {
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({
                status: 'error',
                message: 'No es posible eliminar este proveedor porque ya cuenta con órdenes de compra o historial de suministros asociados.'
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
