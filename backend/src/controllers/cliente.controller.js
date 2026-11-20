const { 
    crearCliente, 
    obtenerClientes, 
    obtenerClientePorId, 
    actualizarCliente, 
    eliminarCliente 
} = require('../models/cliente.model');
const {
    MENSAJES,
    normalizarTexto,
    esNombreCliente,
    esNit,
    esTelefono
} = require('../utils/validators');

function validarDatosCliente(nitCliente, nombreCliente, telefonoCliente) {
    const nit = normalizarTexto(nitCliente).toUpperCase();
    const nombre = normalizarTexto(nombreCliente);
    const telefono = normalizarTexto(telefonoCliente);

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
        const { nitCliente, nombreCliente, telefonoCliente, direccionCliente } = req.body;

        const errorValidacion = validarDatosCliente(nitCliente, nombreCliente, telefonoCliente);
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const telefono = normalizarTexto(telefonoCliente);
        const direccion = normalizarTexto(direccionCliente);

        const idCliente = await crearCliente(
            normalizarTexto(nitCliente).toUpperCase(), 
            normalizarTexto(nombreCliente), 
            telefono ? telefono : null, 
            direccion ? direccion : null
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

        const errorValidacion = validarDatosCliente(nitCliente, nombreCliente, telefonoCliente);
        if (errorValidacion) {
            return res.status(400).json({ status: 'error', message: errorValidacion });
        }

        const telefono = normalizarTexto(telefonoCliente);
        const direccion = normalizarTexto(direccionCliente);

        const filasAfectadas = await actualizarCliente(
            id, 
            normalizarTexto(nitCliente).toUpperCase(), 
            normalizarTexto(nombreCliente), 
            telefono ? telefono : null, 
            direccion ? direccion : null
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
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451) {
            return res.status(400).json({
                status: 'error',
                message: 'No es posible eliminar este cliente porque ya cuenta con facturas o cotizaciones asociadas a su historial.'
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
