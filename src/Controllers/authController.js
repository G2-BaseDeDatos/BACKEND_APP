const jwt                        = require('jsonwebtoken');
const AuthModel                  = require('../Models/authModel');
const { sendSuccess, sendError } = require('../Utils/responseHelper');
const { validationResult }       = require('express-validator');

const authController = {
  /**
   * POST /api/auth/login
   * Recibe { cor_usu, pas_usu } y retorna un JWT si las credenciales son válidas.
   *
   * Nota: Las contraseñas en la BD actualmente están en texto plano.
   * TODO (Fase 7): migrar a bcryptjs con bcrypt.compare().
   */
  login: async (req, res, next) => {
    // Validar campos del body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return sendError(res, errors.array().map(e => e.msg).join(', '), 400);
    }

    try {
      const { cor_usu, pas_usu } = req.body;

      // 1. Buscar usuario por correo
      const usuario = await AuthModel.findByCorreo(cor_usu);

      if (!usuario) {
        return sendError(res, 'Credenciales incorrectas', 401);
      }

      // 2. Verificar contraseña (texto plano por ahora)
      //    TODO: reemplazar por bcrypt.compare(pas_usu, usuario.PAS_USU)
      const passwordValida = pas_usu === usuario.PAS_USU;

      if (!passwordValida) {
        return sendError(res, 'Credenciales incorrectas', 401);
      }

      // 3. Generar JWT
      const payload = {
        id_usu:  usuario.ID_USU,
        nom_usu: usuario.NOM_USU,
        cor_usu: usuario.COR_USU,
        id_rol:  usuario.ID_ROL,
        nom_rol: usuario.NOM_ROL,
      };

      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '8h',
      });

      // 4. Responder con el token y datos básicos del usuario
      sendSuccess(
        res,
        {
          token,
          usuario: {
            id_usu:  usuario.ID_USU,
            nom_usu: usuario.NOM_USU,
            cor_usu: usuario.COR_USU,
            rol:     usuario.NOM_ROL,
          },
        },
        'Inicio de sesión exitoso'
      );
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
