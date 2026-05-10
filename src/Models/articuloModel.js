const oracledb = require('oracledb');
const { getConnection } = require('../Config/db');

class ArticuloModel {
  /**
   * Retorna todos los artículos con JOINs a Categorías, Ubicaciones y Responsable.
   * Soporta filtros opcionales: categoria, estado, ubicacion, responsable.
   * @param {{ categoria?: string, estado?: string, ubicacion?: string, responsable?: string }} filters
   */
  static async findAll(filters = {}) {
    let connection;
    try {
      connection = await getConnection();

      let sql = `
        SELECT a.ID_ART, a.COD_ART, a.NOM_ART, a.EST_ART, a.VAL_ART,
               a.ID_CAT, c.NOM_CAT,
               a.ID_UBI, u.NOM_UBI,
               a.ID_USU, us.NOM_USU AS NOM_RESPONSABLE
        FROM ARTICULOS a
        JOIN CATEGORIAS  c  ON a.ID_CAT = c.ID_CAT
        JOIN UBICACIONES u  ON a.ID_UBI = u.ID_UBI
        LEFT JOIN USUARIOS    us ON a.ID_USU = us.ID_USU
        WHERE 1=1
      `;
      const binds = {};

      if (filters.categoria) {
        sql += ` AND a.ID_CAT = :categoria`;
        binds.categoria = parseInt(filters.categoria, 10);
      }
      if (filters.estado) {
        sql += ` AND a.EST_ART = :estado`;
        binds.estado = filters.estado;
      }
      if (filters.ubicacion) {
        sql += ` AND a.ID_UBI = :ubicacion`;
        binds.ubicacion = parseInt(filters.ubicacion, 10);
      }
      if (filters.responsable) {
        sql += ` AND a.ID_USU = :responsable`;
        binds.responsable = parseInt(filters.responsable, 10);
      }

      sql += ` ORDER BY a.ID_ART`;

      const result = await connection.execute(sql, binds, {
        outFormat: oracledb.OUT_FORMAT_OBJECT,
      });
      return result.rows;
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Retorna un artículo por ID incluyendo sus imágenes.
   * @param {number} id
   */
  static async findById(id) {
    let connection;
    try {
      connection = await getConnection();

      // Artículo con JOINs
      const artResult = await connection.execute(
        `SELECT a.ID_ART, a.COD_ART, a.NOM_ART, a.EST_ART, a.VAL_ART,
                a.ID_CAT, c.NOM_CAT,
                a.ID_UBI, u.NOM_UBI,
                a.ID_USU, us.NOM_USU AS NOM_RESPONSABLE
         FROM ARTICULOS a
         JOIN CATEGORIAS  c  ON a.ID_CAT = c.ID_CAT
         JOIN UBICACIONES u  ON a.ID_UBI = u.ID_UBI
         LEFT JOIN USUARIOS    us ON a.ID_USU = us.ID_USU
         WHERE a.ID_ART = :id`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      if (!artResult.rows[0]) return null;

      // Imágenes del artículo
      const imgResult = await connection.execute(
        `SELECT ID_IMA, URL_IMA FROM IMAGENES_ART WHERE ID_ART = :id ORDER BY ID_IMA`,
        { id },
        { outFormat: oracledb.OUT_FORMAT_OBJECT }
      );

      return {
        ...artResult.rows[0],
        imagenes: imgResult.rows,
      };
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Filtra artículos por estado (Disponible, Prestado, Mantenimiento, Baja).
   * @param {string} estado
   */
  static async findByEstado(estado) {
    return ArticuloModel.findAll({ estado });
  }

  /**
   * Crea un nuevo artículo. El ID lo asigna el trigger.
   * Retorna el ID generado.
   */
  static async create(data) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `INSERT INTO ARTICULOS (ID_CAT, ID_UBI, ID_USU, COD_ART, NOM_ART, EST_ART, VAL_ART)
         VALUES (:id_cat, :id_ubi, :id_usu, :cod_art, :nom_art, :est_art, :val_art)
         RETURNING ID_ART INTO :newId`,
        {
          id_cat: data.id_cat,
          id_ubi: data.id_ubi,
          id_usu: data.id_usu,
          cod_art: data.cod_art,
          nom_art: data.nom_art,
          est_art: data.est_art || 'Disponible',
          val_art: data.val_art,
          newId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT },
        },
        { autoCommit: true }
      );
      return result.outBinds.newId[0];
    } finally {
      if (connection) await connection.close();
    }
  }

  /**
   * Actualiza los datos de un artículo.
   * Retorna filas afectadas.
   */
  static async update(id, data) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `UPDATE ARTICULOS
         SET ID_CAT  = :id_cat,
             ID_UBI  = :id_ubi,
             ID_USU  = :id_usu,
             COD_ART = :cod_art,
             NOM_ART = :nom_art,
             EST_ART = :est_art,
             VAL_ART = :val_art
         WHERE ID_ART = :id`,
        {
          id_cat: data.id_cat,
          id_ubi: data.id_ubi,
          id_usu: data.id_usu,
          cod_art: data.cod_art,
          nom_art: data.nom_art,
          est_art: data.est_art,
          val_art: data.val_art,
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
   * Baja lógica: cambia EST_ART a 'Baja' en lugar de eliminar el registro.
   * Retorna filas afectadas.
   */
  static async darDeBaja(id) {
    let connection;
    try {
      connection = await getConnection();
      const result = await connection.execute(
        `UPDATE ARTICULOS SET EST_ART = 'Baja' WHERE ID_ART = :id`,
        { id },
        { autoCommit: true }
      );
      return result.rowsAffected;
    } finally {
      if (connection) await connection.close();
    }
  }
}

module.exports = ArticuloModel;
