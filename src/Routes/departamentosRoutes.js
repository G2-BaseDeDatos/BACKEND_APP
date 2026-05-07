const express                  = require('express');
const router                   = express.Router();
const departamentosController  = require('../Controllers/departamentosController');
const roleAuth                 = require('../Middlewares/roleAuth');

// GET /api/departamentos       → Acceso: todos los roles
router.get('/',    roleAuth(['Administrador', 'Docente', 'Estudiante']), departamentosController.getAll);

// GET /api/departamentos/:id   → Acceso: todos los roles
router.get('/:id', roleAuth(['Administrador', 'Docente', 'Estudiante']), departamentosController.getById);

module.exports = router;
