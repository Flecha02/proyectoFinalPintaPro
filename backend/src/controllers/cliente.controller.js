const { 
    crearCliente, 
    obtenerClientes, 
    obtenerClientePorId, 
    actualizarCliente, 
    eliminarCliente 
} = require('../models/cliente.model');
// Validaciones para Guatemala (NIT, DPI y Teléfono)
function validarNitDpi(valor) {
    if (!valor) return false;
    const limpio = valor.trim().toUpperCase();
    if (limpio === 'CF' || limpio === 'C.F.') return true;
    const regexNitDpi = /^([0-9]+-?[0-9K]{1}|[0-9]{13})$/;
    return regexNitDpi.test(limpio);
}
function validarTelefonoGT(telefono) {
    if (!telefono) return true;
    const regexTel = /^(\+?502)?[\s-]?[2-7][0-9]{3}[\s-]?[0-9]{4}$/;
    return regexTel.test(telefono.trim());
}
async function registrar(req, res) {
    try {
        const { nitCliente, nombreCliente, telefonoCliente, direccionCliente } = req.body;
        if (!nombreCliente || nombreCliente.trim() === '') {
            return res.status(400).json({ status: 'error', message: 'El nombre del cliente es obligatorio.' });
        }
        if (!validarNitDpi(nitCliente)) {
            return res.status(400).json({ status: 'error', message: 'El formato del NIT o DPI no es válido.' });
        }
        if (!validarTelefonoGT(telefonoCliente)) {
            return res.status(400).json({ status: 'error', message: 'El teléfono del cliente no es un formato válido para Guatemala.' });
        }
        const idCliente = await crearCliente(
            nitCliente.trim(), 
            nombreCliente.trim(), 
            telefonoCliente ? telefonoCliente.trim() : null, 
            direccionCliente ? direccionCliente.trim() : null
        );
        res.status(201).json({
            status: 'success',
            message: 'Cliente registrado correctamente',
            data: { idCliente }
        });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe un cliente registrado con este NIT o DPI.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}
async function listar(req, res) {
    try {
        const { busqueda } = req.query; // Captura ?busqueda=...
        const clientes = await obtenerClientes(busqueda);
        res.json({ status: 'success', data: clientes });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}
async function buscarPorId(req, res) {
    try {
        const { id } = req.params;
        const cliente = await obtenerClientePorId(id);
        if (!cliente) {
            return res.status(404).json({ status: 'error', message: 'Cliente no encontrado.' });
        }
        res.json({ status: 'success', data: cliente });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}
async function actualizar(req, res) {
    try {
        const { id } = req.params;
        const { nitCliente, nombreCliente, telefonoCliente, direccionCliente } = req.body;
        if (!nombreCliente || nombreCliente.trim() === '') {
            return res.status(400).json({ status: 'error', message: 'El nombre del cliente es obligatorio.' });
        }
        if (!validarNitDpi(nitCliente)) {
            return res.status(400).json({ status: 'error', message: 'El formato del NIT o DPI no es válido.' });
        }
        if (!validarTelefonoGT(telefonoCliente)) {
            return res.status(400).json({ status: 'error', message: 'El teléfono del cliente no es un formato válido para Guatemala.' });
        }
        const filasAfectadas = await actualizarCliente(
            id, 
            nitCliente.trim(), 
            nombreCliente.trim(), 
            telefonoCliente ? telefonoCliente.trim() : null, 
            direccionCliente ? direccionCliente.trim() : null
        );
        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Cliente no encontrado para actualizar.' });
        }
        res.json({ status: 'success', message: 'Cliente actualizado correctamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ status: 'error', message: 'Ya existe otro cliente con este NIT o DPI.' });
        }
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function eliminar(req, res) {
    try {
        const { id }  = req.params;
        const filasAfectadas = await eliminarCliente(id);
        if (filasAfectadas === 0) {
            return res.status(404).json({ status: 'error', message: 'Cliente no encontrado para eliminar.' });
        }
        res.json({ status: 'success', message: 'Cliente eliminado correctamente' });
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