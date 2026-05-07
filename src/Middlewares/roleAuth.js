const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación y autorización por roles con JWT.
 *
 * Espera el token en el header: Authorization: Bearer <token>
 * El token debe contener { id_usu, nom_usu, id_rol, nom_rol } en su payload.
 *
 * Uso en rutas:
 *   router.get('/',  roleAuth(['Administrador', 'Docente']), controller.getAll);
 *   router.post('/', roleAuth(['Administrador']),            controller.create);
 *
 * @param {string[]} rolesPermitidos - Roles con acceso al endpoint.
 */
function roleAuth(rolesPermitidos) {
  return (req, res, next) => {
    // 1. Leer el header Authorization
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Acceso denegado. Se requiere un token de autenticación (Authorization: Bearer <token>).',
      });
    }

    const token = authHeader.split(' ')[1];

    // 2. Verificar y decodificar el token
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Verificar que el rol del token esté permitido
      if (!rolesPermitidos.includes(payload.nom_rol)) {
        return res.status(403).json({
          success: false,
          data: null,
          message: `Acceso denegado. Se requiere uno de los roles: [${rolesPermitidos.join(', ')}].`,
        });
      }

      // 4. Exponer el usuario en req para los controladores
      req.usuario = payload; // { id_usu, nom_usu, cor_usu, id_rol, nom_rol }
      next();

    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          data: null,
          message: 'El token ha expirado. Inicia sesión nuevamente.',
        });
      }
      return res.status(401).json({
        success: false,
        data: null,
        message: 'Token inválido.',
      });
    }
  };
}

module.exports = roleAuth;
