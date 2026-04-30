const oracledb = require('oracledb');
require('dotenv').config();

class Database {
  static async getConnection() {
    return await oracledb.getConnection({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT
    });
  }
}

module.exports = Database;