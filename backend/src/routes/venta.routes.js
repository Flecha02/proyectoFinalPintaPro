const { Router } = require('express');
const {
    registrarCotizacion,
    listarCotizaciones,
    buscarCotizacionPorId,
    emitirFactura,
    buscarFacturaImpresion
} = require('../controllers/venta.controller');

const router = Router();
// Cotizaciones
router.post('/cotizaciones', registrarCotizacion);
router.get('/cotizaciones', listarCotizaciones);
router.get('/cotizaciones/:id', buscarCotizacionPorId);
// Facturación
router.post('/facturas', emitirFactura);
router.get('/facturas/:id/impresion', buscarFacturaImpresion);

module.exports = router;