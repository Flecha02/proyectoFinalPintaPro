const {
    crearCotizacion,
    obtenerCotizaciones,
    obtenerCotizacionPorId,
    procesarFacturaFIFO,
    obtenerFacturas,
    obtenerFacturaPorIdImpresion,
    anularFactura
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

        if (!idCliente || !idUsuario || !numeroFactura || !totalFactura || !detalles || !pagos || detalles.length === 0 || !Array.isArray(pagos) || pagos.length === 0) {
            return res.status(400).json({ status: 'error', message: 'Faltan campos obligatorios para facturar.' });
        }

        // Validar cada método de pago y que la sumatoria cuadre con el total de la factura
        let totalPagos = 0;
        for (const p of pagos) {
            const monto = Number(p.montoPago);
            if (!p.idMedioPago || isNaN(monto) || monto <= 0) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Cada método de pago debe tener un medio válido y un monto mayor a cero.'
                });
            }
            totalPagos += monto;
        }

        if (Math.abs(totalPagos - Number(totalFactura)) > 0.05) {
            return res.status(400).json({
                status: 'error',
                message: `El total de los pagos asignados (Q ${totalPagos.toFixed(2)}) no coincide con el total de la factura (Q ${Number(totalFactura).toFixed(2)}).`
            });
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
async function anularFacturaPorNumero(req, res) {
    try {
        const { numeroFactura } = req.params;
        const { idUsuario } = req.body;

        if (!numeroFactura || !idUsuario) {
            return res.status(400).json({
                status: 'error',
                message: 'Se requiere el numeroFactura en la ruta y el idUsuario en el body.'
            });
        }

        const respuestaSP = await anularFactura(numeroFactura, idUsuario);

        if (respuestaSP && respuestaSP.resultado === 1) {
            return res.status(200).json({
                status: 'success',
                message: respuestaSP.mensaje
            });
        } else {
            return res.status(400).json({
                status: 'error',
                message: respuestaSP ? respuestaSP.mensaje : 'No fue posible anular la factura'
            });
        }
    } catch (error) {
        console.error('Error en controlador anularFactura:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Error interno del servidor al procesar la anulación.',
            error: error.message
        });
    }
}

async function listarFacturas(req, res) {
    try {
        const { busqueda } = req.query;
        const facturas = await obtenerFacturas(busqueda);
        res.json({ status: 'success', data: facturas });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    registrarCotizacion,
    listarCotizaciones,
    buscarCotizacionPorId,
    emitirFactura,
    listarFacturas,
    buscarFacturaImpresion,
    anularFacturaPorNumero
};