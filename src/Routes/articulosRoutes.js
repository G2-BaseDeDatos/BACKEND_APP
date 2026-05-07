const express              = require('express');
const router               = express.Router();
const { body }             = require('express-validator');
const articulosController  = require('../Controllers/articulosController');
const roleAuth             = require('../Middlewares/roleAuth');

const TODOS      = ['Administrador', 'Docente', 'Estudiante'];
const SOLO_ADMIN = ['Administrador'];

// ── Validaciones ──────────────────────────────────────────────────────────────
const validarArticulo = [
  body('id_cat') .isInt({ min: 1 }).withMessage('id_cat debe ser un entero válido'),
  body('id_ubi') .isInt({ min: 1 }).withMessage('id_ubi debe ser un entero válido'),
  body('id_usu') .isInt({ min: 1 }).withMessage('id_usu debe ser un entero válido'),
  body('cod_art').trim().notEmpty().withMessage('El código del artículo es requerido')
                 .isLength({ max: 50 }).withMessage('El código no puede exceder 50 caracteres'),
  body('nom_art').trim().notEmpty().withMessage('El nombre del artículo es requerido')
                 .isLength({ max: 150 }).withMessage('El nombre no puede exceder 150 caracteres'),
  body('val_art').isFloat({ min: 0 }).withMessage('El valor debe ser un número positivo'),
];

// ── Rutas ─────────────────────────────────────────────────────────────────────
// ⚠️  /estado/:est DEBE ir ANTES que /:id para evitar conflictos de rutas.

// GET /api/articulos/estado/:est   → todos
router.get('/estado/:est', roleAuth(TODOS), articulosController.getByEstado);

// GET /api/articulos               → todos (con filtros opcionales por query string)
router.get('/',             roleAuth(TODOS), articulosController.getAll);

// GET /api/articulos/:id           → todos
router.get('/:id',          roleAuth(TODOS), articulosController.getById);

// POST /api/articulos              → solo Admin
router.post('/',            roleAuth(SOLO_ADMIN), validarArticulo, articulosController.create);

// PUT /api/articulos/:id           → solo Admin
router.put('/:id',          roleAuth(SOLO_ADMIN), validarArticulo, articulosController.update);

// DELETE /api/articulos/:id        → solo Admin (baja lógica)
router.delete('/:id',       roleAuth(SOLO_ADMIN), articulosController.remove);

module.exports = router;
