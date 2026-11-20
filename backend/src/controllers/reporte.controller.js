const {
    reporteVentasPorMedioPago,
    reporteProductosMasIngresos,
    reporteProductosMasVendidos,
    reporteInventarioActual,
    reporteProductosMenosVendidos,
    reporteProductosAgotados
} = require('../models/reporte.model');
const {
    MENSAJES,
    normalizarTexto,
    esFechaISO,
    esRangoFechasValido
} = require('../utils/validators');

// Valida el par de fechas recibido por query string. Devuelve un mensaje de error o null.
function validarFechasReporte(fechaInicio, fechaFin) {
    const inicio = normalizarTexto(fechaInicio);
    const fin = normalizarTexto(fechaFin);

    if (inicio === '' || fin === '') {
        return 'Se requieren fechaInicio y fechaFin (YYYY-MM-DD).';
    }
    if (!esFechaISO(inicio) || !esFechaISO(fin)) {
        return MENSAJES.FECHA_ISO;
    }
    if (!esRangoFechasValido(inicio, fin)) {
        return MENSAJES.RANGO_FECHAS;
    }
    return null;
}

async function getVentasPorMedioPago(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const errorFecha = validarFechasReporte(fechaInicio, fechaFin);
        if (errorFecha) {
            return res.status(400).json({ status: 'error', message: errorFecha });
        }
        const data = await reporteVentasPorMedioPago(normalizarTexto(fechaInicio), normalizarTexto(fechaFin));
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosMasIngresos(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const errorFecha = validarFechasReporte(fechaInicio, fechaFin);
        if (errorFecha) {
            return res.status(400).json({ status: 'error', message: errorFecha });
        }
        const data = await reporteProductosMasIngresos(normalizarTexto(fechaInicio), normalizarTexto(fechaFin));
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosMasVendidos(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        const errorFecha = validarFechasReporte(fechaInicio, fechaFin);
        if (errorFecha) {
            return res.status(400).json({ status: 'error', message: errorFecha });
        }
        const data = await reporteProductosMasVendidos(normalizarTexto(fechaInicio), normalizarTexto(fechaFin));
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getInventarioActual(req, res) {
    try {
        const data = await reporteInventarioActual();
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosMenosVendidos(req, res) {
    try {
        const data = await reporteProductosMenosVendidos();
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosAgotados(req, res) {
    try {
        const data = await reporteProductosAgotados();
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

module.exports = {
    getVentasPorMedioPago,
    getProductosMasIngresos,
    getProductosMasVendidos,
    getInventarioActual,
    getProductosMenosVendidos,
    getProductosAgotados
};
