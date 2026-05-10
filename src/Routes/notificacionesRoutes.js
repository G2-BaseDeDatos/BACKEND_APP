const express = require('express');
const router = express.Router();
const notificacionesController = require('../Controllers/notificacionesController');
const roleAuth = require('../Middlewares/roleAuth');

const TODOS = ['Administrador', 'Docente', 'Estudiante'];

// GET /api/notificaciones/mis-notificaciones -> Obtiene las alertas del usuario logueado
router.get('/mis-notificaciones', roleAuth(TODOS), notificacionesController.getMisNotificaciones);

// PUT /api/notificaciones/:id/leer -> Marca una notificación como leída
router.put('/:id/leer', roleAuth(TODOS), notificacionesController.marcarComoLeida);

module.exports = router;
