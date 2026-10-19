const { Router } = require('express');
const {
    getVentasPorMedioPago,
    getProductosMasIngresos,
    getProductosMasVendidos,
    getInventarioActual,
    getProductosMenosVendidos,
    getProductosAgotados
} = require('../controllers/reporte.controller');

const router = Router();

router.get('/ventas-medio-pago', getVentasPorMedioPago);
router.get('/productos-mas-ingresos', getProductosMasIngresos);
router.get('/productos-mas-vendidos', getProductosMasVendidos);
router.get('/inventario-actual', getInventarioActual);
router.get('/productos-menos-vendidos', getProductosMenosVendidos);
router.get('/productos-agotados', getProductosAgotados);

module.exports = router;