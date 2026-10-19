const { Router } = require('express');
const { listarCategorias, listarMedidas } = require('../controllers/catalogo.controller');

const router = Router();

router.get('/categorias', listarCategorias);
router.get('/medidas', listarMedidas);

module.exports = router;