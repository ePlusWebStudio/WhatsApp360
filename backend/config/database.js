const mysql = require('mysql2/promise');
const logger = require('../utils/logger');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'wa_bot_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
  multipleStatements: false
});

// Test connection
pool.getConnection()
  .then(connection => {
    logger.info('✅ Database pool created successfully');
    connection.release();
  })
  .catch(error => {
    logger.error('❌ Error creating database pool:', error);
  });

// Query helper
async function query(sql, values = []) {
  try {
    const connection = await pool.getConnection();
    try {
      const [results] = await connection.query(sql, values);
      return results;
    } finally {
      connection.release();
    }
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

// Get connection for transactions
async function getConnection() {
  return await pool.getConnection();
}

// End pool
async function end() {
  return await pool.end();
}

module.exports = {
  query,
  getConnection,
  end,
  pool
};
