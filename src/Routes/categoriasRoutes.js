const express               = require('express');
const router                = express.Router();
const categoriasController  = require('../Controllers/categoriasController');
const roleAuth              = require('../Middlewares/roleAuth');

// GET /api/categorias       → Acceso: todos los roles
router.get('/',    roleAuth(['Administrador', 'Docente', 'Estudiante']), categoriasController.getAll);

// GET /api/categorias/:id   → Acceso: todos los roles
router.get('/:id', roleAuth(['Administrador', 'Docente', 'Estudiante']), categoriasController.getById);

module.exports = router;
