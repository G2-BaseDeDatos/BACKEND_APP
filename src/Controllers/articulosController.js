const ArticuloModel              = require('../Models/articuloModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult }       = require('express-validator');

const articulosController = {
  /**
   * GET /api/articulos?categoria=&estado=&ubicacion=&responsable=
   * Acceso: todos los roles.
   */
  getAll: async (req, res, next) => {
    try {
      const articulos = await ArticuloModel.findAll(req.query);
      sendSuccess(res, articulos, 'Artículos obtenidos correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/articulos/:id  (incluye imágenes)
   * Acceso: todos los roles.
   */
  getById: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const articulo = await ArticuloModel.findById(id);
      if (!articulo) return sendError(res, `Artículo con ID ${id} no encontrado`, 404);

      sendSuccess(res, articulo, 'Artículo obtenido correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * GET /api/articulos/estado/:est
   * Acceso: todos los roles.
   */
  getByEstado: async (req, res, next) => {
    try {
      const estadosValidos = ['Disponible', 'Prestado', 'Mantenimiento', 'Baja'];
      const estado = req.params.est;

      if (!estadosValidos.includes(estado)) {
        return sendError(
          res,
          `Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`,
          400
        );
      }

      const articulos = await ArticuloModel.findByEstado(estado);
      sendSuccess(res, articulos, `Artículos con estado "${estado}" obtenidos correctamente`);
    } catch (err) {
      next(err);
    }
  },

  /**
   * POST /api/articulos
   * Acceso: Administrador.
   */
  create: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }
    try {
      const newId = await ArticuloModel.create(req.body);
      sendSuccess(res, { id_art: newId }, 'Artículo creado correctamente', 201);
    } catch (err) {
      if (err.message && err.message.includes('ORA-00001')) {
        return sendError(res, 'El código de artículo ya está registrado', 409);
      }
      next(err);
    }
  },

  /**
   * PUT /api/articulos/:id
   * Acceso: Administrador.
   */
  update: async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const filas = await ArticuloModel.update(id, req.body);
      if (filas === 0) return sendError(res, `Artículo con ID ${id} no encontrado`, 404);

      sendSuccess(res, { id_art: id }, 'Artículo actualizado correctamente');
    } catch (err) {
      next(err);
    }
  },

  /**
   * DELETE /api/articulos/:id  → baja lógica (EST_ART = 'Baja')
   * Acceso: Administrador.
   */
  remove: async (req, res, next) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) return sendError(res, 'El ID debe ser un número válido', 400);

      const filas = await ArticuloModel.darDeBaja(id);
      if (filas === 0) return sendError(res, `Artículo con ID ${id} no encontrado`, 404);

      sendSuccess(res, { id_art: id }, 'Artículo dado de baja correctamente');
    } catch (err) {
      next(err);
    }
  },
};

module.exports = articulosController;
