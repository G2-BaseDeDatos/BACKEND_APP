const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');
const MovimientoModel = require('./movimientoModel');

class PrestamoModel {
  /**
   * Crea un préstamo junto con sus detalles en una transacción.
   * Si un artículo ya está prestado, el trigger TRG_ARTICULO_UNICO_PRESTAMO
   * debería lanzar el error ORA-20001, que será propagado al controlador.
   */
  static async create(id_usu, fsa_pre, fpr_pre, articulos_ids) {
    let connection;
    try {
      connection = await getConnection();
      // Empezamos transacción manual
      
      // 1. Insertar el préstamo y obtener el ID
      const resultPre = await connection.execute(
        `INSERT INTO PRESTAMOS (ID_USU, FSA_PRE, FPR_PRE)
         VALUES (:id_usu, TO_DATE(:fsa_pre, 'YYYY-MM-DD'), TO_DATE(:fpr_pre, 'YYYY-MM-DD'))
         RETURNING ID_PRE INTO :newId`,
        {
          id_usu,
          fsa_pre,
          fpr_pre,
          newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
        },
        { autoCommit: false } // No hacer commit todavía
      );
      
      const newIdPre = resultPre.outBinds.newId[0];

      // 2. Insertar detalles
      // Si el BD lanza ORA-20001, este bloque lanzará una excepción y el catch hará rollback.
      for (const id_art of articulos_ids) {
        await connection.execute(
          `INSERT INTO DETALLE_PRESTAMOS (ID_PRE, ID_ART)
           VALUES (:id_pre, :id_art)`,
          {
            id_pre: newIdPre,
            id_art: id_art
          },
          { autoCommit: false }
        );
        
        // Registrar movimiento
        await MovimientoModel.create(id_art, `Prestado a usuario ID ${id_usu}`, connection);
      }

      // 3. Insertar notificación automática para el estudiante/docente
      const mensaje = `Tienes un nuevo préstamo asignado. Debes devolverlo máximo el ${fpr_pre}.`;
      await connection.execute(
        `INSERT INTO NOTIFICACIONES (ID_PRE, MEN_NOT, EST_NOT)
         VALUES (:id_pre, :men_not, 'Pendiente')`,
        {
          id_pre: newIdPre,
          men_not: mensaje
        },
        { autoCommit: false }
      );

      await connection.commit();
      return newIdPre;
    } catch (err) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackErr) {
          console.error('Error al hacer rollback:', rollbackErr);
        }
      }
      throw err; // Relanzamos para atrapar ORA-20001 en el controlador
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeErr) {
          console.error('Error cerrando la conexión', closeErr);
        }
      }
    }
  }

  /**
   * Actualiza a estado 'Devuelto'.
   * El trigger TRG_ACTUALIZAR_ESTADO_ARTICULO se encarga de cambiar el estado 
   * de los artículos a 'Disponible' automáticamente.
   */
  static async devolver(id_pre) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `UPDATE PRESTAMOS SET EST_PRE = 'Devuelto' WHERE ID_PRE = :id_pre`,
        { id_pre },
        { autoCommit: false }
      );
      
      // Consultamos los articulos de este prestamo para registrarlos como devueltos
      const detResult = await connection.execute(
        `SELECT ID_ART FROM DETALLE_PRESTAMOS WHERE ID_PRE = :id_pre`,
        { id_pre }
      );
      for (const row of detResult.rows) {
        await MovimientoModel.create(row[0], 'Devuelto de préstamo', connection);
      }

      await connection.commit();
      return result.rowsAffected;
    } catch (err) {
      if (connection) await connection.rollback();
      throw err;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Obtiene todos los préstamos globales.
   */
  static async findAll() {
    let connection;
    try {
      connection = await getConnection();
      const sql = `
        SELECT p.ID_PRE, p.FSA_PRE, p.FPR_PRE, p.EST_PRE,
               u.ID_USU, u.NOM_USU, u.COR_USU
        FROM PRESTAMOS p
        JOIN USUARIOS u ON p.ID_USU = u.ID_USU
        ORDER BY p.ID_PRE DESC
      `;
      const result = await connection.execute(sql, [], { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Obtiene los préstamos de un usuario específico junto con los equipos que tiene.
   */
  static async findByUsuario(id_usu) {
    let connection;
    try {
      connection = await getConnection();
      const sql = `
        SELECT p.ID_PRE, p.FSA_PRE, p.FPR_PRE, p.EST_PRE,
               d.ID_ART, a.NOM_ART, a.COD_ART
        FROM PRESTAMOS p
        JOIN DETALLE_PRESTAMOS d ON p.ID_PRE = d.ID_PRE
        JOIN ARTICULOS a ON d.ID_ART = a.ID_ART
        WHERE p.ID_USU = :id_usu
        ORDER BY p.FSA_PRE DESC
      `;
      const result = await connection.execute(sql, { id_usu }, { outFormat: oracledb.OUT_FORMAT_OBJECT });
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = PrestamoModel;
