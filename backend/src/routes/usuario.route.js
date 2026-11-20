const { Router } = require('express');
const { registrar, login, listar, listarRoles } = require('../controllers/usuario.controller');

const router = Router();

router.post('/registro', registrar);
router.post('/login', login);
router.get('/roles', listarRoles);
router.get('/', listar);

module.exports = router;
