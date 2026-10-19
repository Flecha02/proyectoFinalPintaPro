const { Router } = require('express');
const { registrar, listar, buscarPorId, actualizar, eliminar } = require('../controllers/cliente.controller');

const router = Router();

router.post('/', registrar);
router.get('/', listar);
router.get('/:id', buscarPorId);
router.put('/:id', actualizar);
router.delete('/:id', eliminar);

module.exports = router;