/**
 * Middleware global de manejo de errores.
 * Captura cualquier error lanzado desde controladores o middlewares
 * y devuelve el formato estándar sin exponer el stack al cliente.
 *
 * Uso en app.js: app.use(errorHandler)  ← debe ir AL FINAL de todos los middlewares.
 */
function errorHandler(err, req, res, next) {
  // Log interno (solo en el servidor)
  console.error(`[ERROR] ${req.method} ${req.path} →`, err.message || err);

  const status = err.status || err.statusCode || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'Error interno del servidor'
      : err.message || 'Error interno del servidor';

  return res.status(status).json({
    success: false,
    data: null,
    message,
  });
}

module.exports = errorHandler;
