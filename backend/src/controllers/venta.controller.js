const {
    crearCotizacion,
    obtenerCotizaciones,
    obtenerCotizacionPorId,
    procesarFacturaFIFO,
    obtenerFacturaPorIdImpresion
} = require('../models/venta.model');

// COTIZACIONES
async function registrarCotizacion(req, res) {
    try {
        const { idCliente, idUsuario, totalCotizacion, detalles } = req.body;

        if (!idCliente || !idUsuario || !totalCotizacion || !detalles || !Array.isArray(detalles) || detalles.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Datos incompletos para registrar la cotización.' });
        }

        const idCotizacion = await crearCotizacion(idCliente, idUsuario, totalCotizacion, detalles);
        res.status(201).json({ status: 'success', message: 'Cotización generada exitosamente', data: { idCotizacion } });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function listarCotizaciones(req, res) {
    try {
        const cotizaciones = await obtenerCotizaciones();
        res.json({ status: 'success', data: cotizaciones });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function buscarCotizacionPorId(req, res) {
    try {
        const { id } = req.params;
        const cotizacion = await obtenerCotizacionPorId(id);
        if (!cotizacion) {
            return res.status(404).json({ status: 'error', message: 'Cotización no encontrada.' });
        }
        res.json({ status: 'success', data: cotizacion });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

// FACTURACIÓN
async function emitirFactura(req, res) {
    try {
        const { idCotizacion, idCliente, idUsuario, numeroFactura, totalFactura, detalles, pagos } = req.body;

        if (!idCliente || !idUsuario || !numeroFactura || !totalFactura || !detalles || !pagos || detalles.length === 0 || pagos.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios para facturar.' });
        }

        const idFactura = await procesarFacturaFIFO(
            idCotizacion,
            idCliente,
            idUsuario,
            numeroFactura.trim(),
            totalFactura,
            detalles,
            pagos
        );

        res.status(201).json({
            status: 'success',
            message: 'Factura procesada correctamente con salida FIFO de lotes.',
            data: { idFactura }
        });
    } catch (error) {
        res.status(400).json({ status: 'error', message: error.message });
    }
}

async function buscarFacturaImpresion(req, res) {
    try {
        const { id } = req.params;
        const data = await obtenerFacturaPorIdImpresion(id);
        if (!data) {
            return res.status(404).json({ status: 'error', message: 'Factura no encontrada.' });
        }
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}
module.exports = {
    registrarCotizacion,
    listarCotizaciones,
    buscarCotizacionPorId,
    emitirFactura,
    buscarFacturaImpresion
};