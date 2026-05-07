const express            = require('express');
const router             = express.Router();
const rolesController    = require('../Controllers/rolesController');
const roleAuth           = require('../Middlewares/roleAuth');

// GET /api/roles         → Acceso: Docente, Administrador
router.get('/',    roleAuth(['Administrador', 'Docente']), rolesController.getAll);

// GET /api/roles/:id     → Acceso: Docente, Administrador
router.get('/:id', roleAuth(['Administrador', 'Docente']), rolesController.getById);

module.exports = router;
