const { Router } = require('express');
const { registrarOrden, listarOrdenes, buscarOrdenPorId, recibirIngresoBodega} = require('../controllers/compra.controller');

const router = Router();

// Órdenes de compra
router.post('/ordenes', registrarOrden);
router.get('/ordenes', listarOrdenes);
router.get('/ordenes/:id', buscarOrdenPorId);
// Ingresos a Bodega
router.post('/ingresos-bodega', recibirIngresoBodega);

module.exports = router;