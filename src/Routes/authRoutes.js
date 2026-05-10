const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../Controllers/authController');

// ── Validaciones del login ────────────────────────────────────────────────────
const validarLogin = [
  body('cor_usu')
    .trim()
    .isEmail().withMessage('Debe proporcionar un correo electrónico válido'),
  body('pas_usu')
    .notEmpty().withMessage('La contraseña es requerida'),
];

// POST /api/auth/login   → público (sin middleware de rol)
router.post('/login', validarLogin, authController.login);

module.exports = router;
