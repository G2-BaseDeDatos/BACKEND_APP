const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const mantenimientosController = require('../Controllers/mantenimientosController');
const roleAuth = require('../Middlewares/roleAuth');

const ADMIN_DOC = ['Administrador', 'Docente'];

const validarMantenimiento = [
  body('id_art').isInt({ min: 1 }).withMessage('ID de artículo inválido'),
  body('tip_man').isIn(['Preventivo', 'Correctivo']).withMessage('tip_man debe ser Preventivo o Correctivo'),
  body('fec_man').isDate().withMessage('La fecha debe tener formato YYYY-MM-DD'),
  body('des_man').trim().notEmpty().withMessage('La descripción es obligatoria')
                 .isLength({ max: 500 }).withMessage('La descripción es demasiado larga (máx 500)')
];

// GET /api/mantenimientos -> Listar equipos en reparación
router.get('/', roleAuth(ADMIN_DOC), mantenimientosController.getActivos);

// POST /api/mantenimientos -> Enviar a reparación
router.post('/', roleAuth(ADMIN_DOC), validarMantenimiento, mantenimientosController.create);

// PUT /api/mantenimientos/:id/finalizar -> Terminar reparación
router.put('/:id/finalizar', roleAuth(ADMIN_DOC), [
  param('id').isInt({ min: 1 }).withMessage('ID de mantenimiento inválido'),
  body('id_art').isInt({ min: 1 }).withMessage('Se requiere el ID del artículo para liberarlo')
], mantenimientosController.finalizar);

module.exports = router;
