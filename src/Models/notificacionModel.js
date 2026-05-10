const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');

class NotificacionModel {
  /**
   * Crea una nueva notificación asociada a un préstamo.
   */
  static async create(id_pre, men_not, est_not = 'Pendiente') {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `INSERT INTO NOTIFICACIONES (ID_PRE, MEN_NOT, EST_NOT)
         VALUES (:id_pre, :men_not, :est_not)
         RETURNING ID_NOT INTO :newId`,
        {
          id_pre,
          men_not,
          est_not,
          newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: true }
      );
      return result.outBinds.newId[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Marca una notificación como leída.
   */
  static async marcarLeida(id_not) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `UPDATE NOTIFICACIONES SET EST_NOT = 'Enviado' WHERE ID_NOT = :id_not`,
        { id_not },
        { autoCommit: true }
      );
      return result.rowsAffected;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Obtiene todas las notificaciones de un usuario (uniendo con PRESTAMOS).
   */
  static async findByUsuario(id_usu) {
    let connection;
    try {
      connection = await getConnection();
      // Unimos NOTIFICACIONES con PRESTAMOS para filtrar por ID_USU
      const result = await connection.execute(
        `SELECT n.ID_NOT, n.MEN_NOT, n.EST_NOT, p.ID_PRE, p.FSA_PRE, p.FPR_PRE
         FROM NOTIFICACIONES n
         JOIN PRESTAMOS p ON n.ID_PRE = p.ID_PRE
         WHERE p.ID_USU = :id_usu
         ORDER BY n.ID_NOT DESC`,
        { id_usu },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = NotificacionModel;
