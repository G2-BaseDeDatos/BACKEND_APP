const express                = require('express');
const router                 = express.Router();
const ubicacionesController  = require('../Controllers/ubicacionesController');
const roleAuth               = require('../Middlewares/roleAuth');

const TODOS = ['Administrador', 'Docente', 'Estudiante'];

// ⚠️  IMPORTANTE: la ruta /departamento/:idDep DEBE ir ANTES que /:id
// de lo contrario Express interpreta "departamento" como un ID numérico.

// GET /api/ubicaciones/departamento/:idDep  → todos los roles
router.get('/departamento/:idDep', roleAuth(TODOS), ubicacionesController.getByDepartamento);

// GET /api/ubicaciones                      → todos los roles
router.get('/',    roleAuth(TODOS), ubicacionesController.getAll);

// GET /api/ubicaciones/:id                  → todos los roles
router.get('/:id', roleAuth(TODOS), ubicacionesController.getById);

module.exports = router;
