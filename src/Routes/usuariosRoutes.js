const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const usuariosController = require('../Controllers/usuariosController');
const roleAuth = require('../Middlewares/roleAuth');

const SOLO_ADMIN = ['Administrador'];
const ADMIN_DOC = ['Administrador', 'Docente'];

// ── Validaciones personalizadas ────────────────────────────────────────────────
const customValidarCorreo = (value, { req }) => {
  if (!value || !value.endsWith('@uta.edu.ec')) {
    throw new Error('El correo debe ser estrictamente de la universidad (@uta.edu.ec)');
  }

  const { id_rol, ced_usu, nom_usu } = req.body;
  if (!id_rol || !ced_usu || !nom_usu) return true; // Faltan datos, fallarán sus propios checks

  const nombres = nom_usu.trim().toLowerCase().split(/\s+/);
  if (nombres.length < 2) return true; // No hay suficientes palabras para extraer nombre y apellido

  const primeraLetraNombre = nombres[0].charAt(0);
  const apellido = nombres[1]; // Tomamos la segunda palabra como apellido

  // Nota: Asumimos que id_rol = 2 es Docente y id_rol = 3 es Estudiante
  if (id_rol === 3 || id_rol === '3') { // Estudiante
    if (ced_usu.length < 4) return true;
    const ultimos4 = ced_usu.slice(-4);
    const formatoEsperado = `${primeraLetraNombre}${apellido}${ultimos4}@uta.edu.ec`;
    if (value.toLowerCase() !== formatoEsperado) {
      throw new Error(`Para estudiantes el correo debe ser: ${formatoEsperado}`);
    }
  } else if (id_rol === 2 || id_rol === '2') { // Docente
    const formatoEsperado = `${primeraLetraNombre}${apellido}@uta.edu.ec`;
    if (value.toLowerCase() !== formatoEsperado) {
      throw new Error(`Para docentes el correo debe ser: ${formatoEsperado}`);
    }
  }

  return true;
};

// ── Validaciones reutilizables ────────────────────────────────────────────────
const validarCrear = [
  body('id_rol').isInt({ min: 1 }).withMessage('id_rol debe ser un número entero válido'),
  body('ced_usu').trim().notEmpty().withMessage('La cédula es requerida')
    .isLength({ min: 10, max: 10 }).withMessage('La cédula debe tener exactamente 10 caracteres')
    .isNumeric().withMessage('La cédula solo debe contener números'),
  body('nom_usu').trim().notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras y espacios'),
  body('cor_usu').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido')
    .custom(customValidarCorreo),
  body('pas_usu').isLength({ min: 8 }).withMessage('La contraseña debe tener al menos 8 caracteres'),
];

const validarActualizar = [
  body('id_rol').isInt({ min: 1 }).withMessage('id_rol debe ser un número entero válido'),
  body('ced_usu').trim().notEmpty().withMessage('La cédula es requerida')
    .isLength({ min: 10, max: 10 }).withMessage('La cédula debe tener exactamente 10 caracteres')
    .isNumeric().withMessage('La cédula solo debe contener números'),
  body('nom_usu').trim().notEmpty().withMessage('El nombre es requerido')
    .isLength({ min: 3, max: 100 }).withMessage('El nombre debe tener entre 3 y 100 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/).withMessage('El nombre solo debe contener letras y espacios'),
  body('cor_usu').trim().isEmail().withMessage('Debe proporcionar un correo electrónico válido')
    .custom(customValidarCorreo),
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
