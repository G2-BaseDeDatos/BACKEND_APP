const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usuariosController = require('../Controllers/usuariosController');
const roleAuth = require('../Middlewares/roleAuth');

const SOLO_ADMIN = ['Administrador'];
const ADMIN_DOC = ['Administrador', 'Docente'];

// ── Validaciones reutilizables ────────────────────────────────────────────────
const validarCrear = [
  body('id_rol').isInt({ min: 1 }).withMessage('id_rol debe ser un número entero válido'),
  body('ced_usu').trim().notEmpty().withMessage('La cédula es requerida')
    .isLength({ max: 20 }).withMessage('La cédula no puede exceder 20 caracteres'),
  body('nom_usu').trim().notEmpty().withMessage('El nombre es requerido')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres'),
  body('cor_usu').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('pas_usu').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
];

const validarActualizar = [
  body('id_rol').isInt({ min: 1 }).withMessage('id_rol debe ser un número entero válido'),
  body('ced_usu').trim().notEmpty().withMessage('La cédula es requerida'),
  body('nom_usu').trim().notEmpty().withMessage('El nombre es requerido'),
  body('cor_usu').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
];

// ── Rutas ─────────────────────────────────────────────────────────────────────

// GET  /api/usuarios       → Administrador, Docente
router.get('/', roleAuth(ADMIN_DOC), usuariosController.getAll);

// GET  /api/usuarios/:id   → Administrador, Docente
router.get('/:id', roleAuth(ADMIN_DOC), usuariosController.getById);

// POST /api/usuarios       → solo Administrador
router.post('/', roleAuth(SOLO_ADMIN), validarCrear, usuariosController.create);

// PUT  /api/usuarios/:id   → solo Administrador
router.put('/:id', roleAuth(SOLO_ADMIN), validarActualizar, usuariosController.update);

// DELETE /api/usuarios/:id → solo Administrador
router.delete('/:id', roleAuth(SOLO_ADMIN), usuariosController.remove);

module.exports = router;
