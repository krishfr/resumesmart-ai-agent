// backend/src/config/database.js
const { Pool } = require('pg');
const mysql = require('mysql2/promise');
const { envConfig } = require('./env');
const logger = require('../utils/logger');

let pool;
console.log('DB CONNECTING TO =>', {
  host: envConfig.DB_HOST,
  port: envConfig.DB_PORT,
  db: envConfig.DB_NAME
});


const createPostgresPool = () => {
  return new Pool({
    host: envConfig.DB_HOST || '127.0.0.1',
    port: envConfig.DB_PORT,
    database: envConfig.DB_NAME,
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  });
};

const createMySQLPool = () => {
  return mysql.createPool({
    host: envConfig.DB_HOST,
    port: envConfig.DB_PORT,
    database: envConfig.DB_NAME,
    user: envConfig.DB_USER,
    password: envConfig.DB_PASSWORD,
    waitForConnections: true,
    connectionLimit: 20,
    queueLimit: 0
  });
};

const connectDatabase = async () => {
  try {
    if (envConfig.DB_TYPE === 'postgres') {
      pool = createPostgresPool();

      // Test connection
      const client = await pool.connect();
      await client.query('SELECT NOW()');

      // ✅ ADD THIS BLOCK (DB + SCHEMA CHECK)
      const ctx = await client.query(`
        SELECT current_database() AS db,
               current_schema()   AS schema
      `);
      console.log('DB CONTEXT =>', ctx.rows[0]);
      // ✅ END

      client.release();
    } else if (envConfig.DB_TYPE === 'mysql') {
      pool = createMySQLPool();

      // Test connection
      const connection = await pool.getConnection();
      await connection.query('SELECT 1');
      connection.release();
    } else {
      throw new Error(`Unsupported database type: ${envConfig.DB_TYPE}`);
    }

    logger.info(`Connected to ${envConfig.DB_TYPE} database`);
    return pool;
  } catch (error) {
    logger.error('Database connection failed:', error);
    throw error;
  }
};


const getPool = () => {
  if (!pool) {
    throw new Error('Database pool not initialized');
  }
  return pool;
};

const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { text, duration, rows: result.rowCount || result[0]?.length });
    return result;
  } catch (error) {
    logger.error('Query error:', { text, error: error.message });
    throw error;
  }
};

module.exports = {
  connectDatabase,
  getPool,
  query
};