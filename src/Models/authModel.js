const oracledb          = require('oracledb');
const { getConnection } = require('../Config/db');

class AuthModel {
  /**
   * Busca un usuario por correo electrónico para el proceso de login.
   * Retorna todos los campos incluyendo PAS_USU para comparar.
   * @param {string} correo
   * @returns {Promise<object|null>}
   */
  static async findByCorreo(correo) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_USU, u.NOM_USU, u.COR_USU, u.PAS_USU,
                u.ID_ROL, r.NOM_ROL
         FROM USUARIOS u
         JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         WHERE UPPER(u.COR_USU) = UPPER(:correo)`,
        { correo },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = AuthModel;
