const express = require('express');
const router = express.Router();
const auditoriasController = require('../Controllers/auditoriasController');
const roleAuth = require('../Middlewares/roleAuth');

const SOLO_ADMIN = ['Administrador'];

// GET /api/auditorias -> Listar logs de seguridad
router.get('/', roleAuth(SOLO_ADMIN), auditoriasController.getAll);

module.exports = router;
