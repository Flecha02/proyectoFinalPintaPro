const { Router } = require('express');
const {
    registrarCotizacion,
    listarCotizaciones,
    buscarCotizacionPorId,
    emitirFactura,
    buscarFacturaImpresion,
    anularFactura,
    anularFacturaPorNumero
} = require('../controllers/venta.controller');

const router = Router();
// Cotizaciones
router.post('/cotizaciones', registrarCotizacion);
router.get('/cotizaciones', listarCotizaciones);
router.get('/cotizaciones/:id', buscarCotizacionPorId);
// Facturación
router.post('/facturas', emitirFactura);
router.get('/facturas/:id/impresion', buscarFacturaImpresion);
router.put('/facturas/anular/:numeroFactura', anularFacturaPorNumero);

module.exports = router;