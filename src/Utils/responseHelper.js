/**
 * Respuesta exitosa estándar.
 * @param {import('express').Response} res
 * @param {any} data        - Payload de la respuesta
 * @param {string} message  - Mensaje descriptivo
 * @param {number} status   - HTTP status code (default 200)
 */
function sendSuccess(res, data, message = 'Operación exitosa', status = 200) {
  return res.status(status).json({
    success: true,
    data,
    message,
  });
}

/**
 * Respuesta de error estándar.
 * @param {import('express').Response} res
 * @param {string} message  - Mensaje de error amigable
 * @param {number} status   - HTTP status code (default 500)
 */
function sendError(res, message = 'Error interno del servidor', status = 500) {
  return res.status(status).json({
    success: false,
    data: null,
    message,
  });
}

module.exports = { sendSuccess, sendError };
