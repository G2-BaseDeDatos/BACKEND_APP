const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const prestamosController = require('../Controllers/prestamosController');
const roleAuth = require('../Middlewares/roleAuth');

const TODOS = ['Administrador', 'Docente', 'Estudiante'];
const ADMIN_DOC = ['Administrador', 'Docente'];

// ── Validaciones ──────────────────────────────────────────────────────────────
const validarPrestamo = [
  body('id_usu').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
  body('fsa_pre').isDate().withMessage('La fecha de salida debe tener formato YYYY-MM-DD'),
  body('fpr_pre').isDate().withMessage('La fecha prevista de retorno debe tener formato YYYY-MM-DD')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.fsa_pre)) {
        throw new Error('La fecha prevista de retorno (FPR_PRE) debe ser estrictamente mayor a la fecha de salida (FSA_PRE).');
      }
      return true;
    }),
  body('articulos_ids').isArray({ min: 1 }).withMessage('Debe proporcionar un arreglo de IDs de artículos (articulos_ids)')
];

// ── Rutas ─────────────────────────────────────────────────────────────────────

// GET /api/prestamos/mis-prestamos → Para que Estudiante/Docente vea sus equipos actuales
router.get('/mis-prestamos', roleAuth(TODOS), prestamosController.getMisPrestamos);

// GET /api/prestamos               → Listado global de préstamos (Solo Admin y Docente)
router.get('/', roleAuth(ADMIN_DOC), prestamosController.getAll);

// POST /api/prestamos              → Crear un préstamo
router.post('/', roleAuth(ADMIN_DOC), validarPrestamo, prestamosController.create);

// PUT /api/prestamos/:id/devolucion → Registrar devolución de un equipo
router.put('/:id/devolucion', roleAuth(ADMIN_DOC), [
  param('id').isInt({ min: 1 }).withMessage('ID de préstamo inválido')
], prestamosController.devolucion);

module.exports = router;
