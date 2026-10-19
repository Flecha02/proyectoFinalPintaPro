const { Router } = require('express');
const { listarCategorias, listarMedidas, listarUbicaciones } = require('../controllers/catalogo.controller');

const router = Router();

router.get('/categorias', listarCategorias);
router.get('/medidas', listarMedidas);
router.get('/ubicaciones-bodega', listarUbicaciones);

module.exports = router;