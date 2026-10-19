const { crearProveedor, obtenerProveedores, obtenerProveedorPorId, actualizarProveedor, eliminarProveedor } = require('../models/proveedor.model');
// Validaciones actualizadas para Guatemala
function validarNitDpi(valor) {
    if (!valor) return false;
    const limpio = valor.trim().toUpperCase();
    if (limpio === 'CF' || limpio === 'C.F.') return true;
    const regexNitDpi = /^([0-9]+-?[0-9K]{1}|[0-9]{13})$/;
    return regexNitDpi.test(limpio);
}
function validarTelefonoGT(telefono) {
    if (!telefono) return true; // Opcional según la BD
    const regexTel = /^(\+?502)?[\s-]?[2-7][0-9]{3}[\s-]?[0-9]{4}$/;
    return regexTel.test(telefono.trim());
}
async function registrar(req, res) {
    try {
        const { nitProveedor, nombreProveedor, telefonoProveedor, direccionProveedor} = req.body;
        if (!nombreProveedor || nombreProveedor.trim() === '') {
            return res.status(400).json({ status: 'error', message: 'El nombre del proveedor es obligatorio.' });
        }
        if (!validarNitDpi(nitProveedor)) {
            return res.status(400).json({ status: 'error', message: 'El formato del NIT o DPI no es válido.' });
        }
        if (!validarTelefonoGT(telefonoProveedor)) {
            return res.status(400).json({ status: 'error', message: 'El teléfono del proveedor no es un formato válido para Guatemala.' });
        }
        const idProveedor = await crearProveedor(
            nitProveedor.trim(), 
            nombreProveedor.trim(), 
            telefonoProveedor ? telefonoProveedor.trim() : null, 
            direccionProveedor ? direccionProveedor.trim() : null
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
        if (!nombreProveedor || nombreProveedor.trim() === '') {
            return res.status(400).json({ status: 'error', message: 'El nombre del proveedor es obligatorio.' });
        }
        if (!validarNitDpi(nitProveedor)) {
            return res.status(400).json({ status: 'error', message: 'El formato del NIT o DPI no es válido.' });
        }
        if (!validarTelefonoGT(telefonoProveedor)) {
            return res.status(400).json({ status: 'error', message: 'El teléfono del proveedor no es un formato válido para Guatemala.' });
        }
        const filasAfectadas = await actualizarProveedor(
            id, 
            nitProveedor.trim(), 
            nombreProveedor.trim(), 
            telefonoProveedor ? telefonoProveedor.trim() : null, 
            direccionProveedor ? direccionProveedor.trim() : null
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