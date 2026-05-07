const UsuarioModel = require('../Models/usuarioModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult } = require('express-validator');

const usuariosController = {
  /**
   * GET /api/usuarios
   * Acceso: Administrador, Docente.
   */
  getAll: async (req, res, next) => {
    try {
      const usuarios = await UsuarioModel.findAll();
      sendSuccess(res, usuarios, 'Usuarios obtenidos correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/usuarios/:id
   * Acceso: Administrador, Docente.
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const usuario = await UsuarioModel.findById(id);
      if (!usuario) return sendError(res, `Usuario con ID ${id} no encontrado`, 404);

      sendSuccess(res, usuario, 'Usuario obtenido correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/usuarios
   * Crea un nuevo usuario. Acceso: Administrador.
   */
  create: async (req, res, next) => {
    // Verificar errores de validación (express-validator)
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    try {
      const newId = await UsuarioModel.create(req.body);
      sendSuccess(res, { id_usu: newId }, 'Usuario creado correctamente', 201);
    } catch (err) {
      // ORA-00001: cédula o correo duplicado (unique constraint)
      if (err.message && err.message.includes('ORA-00001')) {
        return sendError(res, 'La cédula o el correo ya están registrados', 409);
      }
      next(err);
    }
  },

  /**
   * PUT /api/usuarios/:id
   * Actualiza un usuario. Acceso: Administrador.
   */
  update: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const filas = await UsuarioModel.update(id, req.body);
      if (filas === 0) return sendError(res, `Usuario con ID ${id} no encontrado`, 404);

      sendSuccess(res, { id_usu: id }, 'Usuario actualizado correctamente');
    } catch (err) {
      if (err.message && err.message.includes('ORA-00001')) {
        return sendError(res, 'La cédula o el correo ya están en uso por otro usuario', 409);
      }
      next(err);
    }
  },

  /**
   * DELETE /api/usuarios/:id
   * Elimina un usuario. Acceso: Administrador.
   */
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const filas = await UsuarioModel.remove(id);
      if (filas === 0) return sendError(res, `Usuario con ID ${id} no encontrado`, 404);

      sendSuccess(res, { id_usu: id }, 'Usuario eliminado correctamente');
    } catch (err) {
      // ORA-02292: tiene registros dependientes (préstamos, etc.)
      if (err.message && err.message.includes('ORA-02292')) {
        return sendError(res, 'No se puede eliminar: el usuario tiene registros asociados', 409);
      }
      next(err);
    }
  },
};

module.exports = usuariosController;
