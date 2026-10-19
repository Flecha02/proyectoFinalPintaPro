const {
    reporteVentasPorMedioPago,
    reporteProductosMasIngresos,
    reporteProductosMasVendidos,
    reporteInventarioActual,
    reporteProductosMenosVendidos,
    reporteProductosAgotados
} = require('../models/reporte.model');

async function getVentasPorMedioPago(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ status: 'error', message: 'Se requieren fechaInicio y fechaFin (YYYY-MM-DD).' });
        }
        const data = await reporteVentasPorMedioPago(fechaInicio, fechaFin);
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosMasIngresos(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ status: 'error', message: 'Se requieren fechaInicio y fechaFin (YYYY-MM-DD).' });
        }
        const data = await reporteProductosMasIngresos(fechaInicio, fechaFin);
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ status: 'error', message: error.message });
    }
}

async function getProductosMasVendidos(req, res) {
    try {
        const { fechaInicio, fechaFin } = req.query;
        if (!fechaInicio || !fechaFin) {
            return res.status(400).json({ status: 'error', message: 'Se requieren fechaInicio y fechaFin (YYYY-MM-DD).' });
        }
        const data = await reporteProductosMasVendidos(fechaInicio, fechaFin);
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