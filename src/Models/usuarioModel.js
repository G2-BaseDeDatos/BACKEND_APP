const oracledb          = require('oracledb');
const { getConnection } = require('../Config/db');

class UsuarioModel {
  /**
   * Retorna todos los usuarios (sin contraseña). Incluye nombre del rol.
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_USU, u.CED_USU, u.NOM_USU, u.COR_USU,
                u.ID_ROL, r.NOM_ROL
         FROM USUARIOS u
         JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         ORDER BY u.ID_USU`,
        [],
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna un usuario por ID (sin contraseña).
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `SELECT u.ID_USU, u.CED_USU, u.NOM_USU, u.COR_USU,
                u.ID_ROL, r.NOM_ROL
         FROM USUARIOS u
         JOIN ROLES r ON u.ID_ROL = r.ID_ROL
         WHERE u.ID_USU = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );
      return result.rows[0] || null;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Crea un nuevo usuario. El ID lo asigna el trigger automáticamente.
   * Retorna el ID generado.
   * TODO (Fase 7): hashear PAS_USU con bcryptjs antes de insertar.
   */
  static async create(data) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `INSERT INTO USUARIOS (ID_ROL, CED_USU, NOM_USU, COR_USU, PAS_USU)
         VALUES (:id_rol, :ced_usu, :nom_usu, :cor_usu, :pas_usu)
         RETURNING ID_USU INTO :newId`,
        {
          id_rol:  data.id_rol,
          ced_usu: data.ced_usu,
          nom_usu: data.nom_usu,
          cor_usu: data.cor_usu,
          pas_usu: data.pas_usu,
          newId:   { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        },
        { autoCommit: true }
      );
      return result.outBinds.newId[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Actualiza los datos de un usuario por ID.
   * Retorna el número de filas afectadas.
   */
  static async update(id, data) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `UPDATE USUARIOS
         SET ID_ROL  = :id_rol,
             CED_USU = :ced_usu,
             NOM_USU = :nom_usu,
             COR_USU = :cor_usu
         WHERE ID_USU = :id`,
        {
          id_rol:  data.id_rol,
          ced_usu: data.ced_usu,
          nom_usu: data.nom_usu,
          cor_usu: data.cor_usu,
          id,
        },
        { autoCommit: true }
      );
      return result.rowsAffected;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Elimina un usuario por ID (eliminación física).
   * Retorna el número de filas afectadas.
   */
  static async remove(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `DELETE FROM USUARIOS WHERE ID_USU = :id`,
        { id },
        { autoCommit: true }
      );
      return result.rowsAffected;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = UsuarioModel;
