const mysql = require('mysql2/promise');

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'healthcare_db',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Database connection established successfully!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Error connecting to database:', error.message);
    return false;
  }
};

// Execute SQL query
const query = async (sql, params) => {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Error executing query:', error.message);
    throw error;
  }
};

// Simple CRUD operations
const dbOperations = {
  // Generic operations
  findById: async (table, id) => {
    const sql = `SELECT * FROM ${table} WHERE id = ?`;
    const results = await query(sql, [id]);
    return results[0];
  },

  findAll: async (table, conditions = {}, limit = 100, offset = 0) => {
    let sql = `SELECT * FROM ${table}`;
    const params = [];
    
    // Add WHERE clauses if conditions are provided
    if (Object.keys(conditions).length > 0) {
      sql += ' WHERE ';
      const clauses = [];
      
      for (const [key, value] of Object.entries(conditions)) {
        clauses.push(`${key} = ?`);
        params.push(value);
      }
      
      sql += clauses.join(' AND ');
    }
    
    sql += ` LIMIT ? OFFSET ?`;
    params.push(limit, offset);
    
    return await query(sql, params);
  },

  create: async (table, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const result = await query(sql, values);
    
    return {
      id: result.insertId,
      ...data
    };
  },

  update: async (table, id, data) => {
    const keys = Object.keys(data);
    const values = Object.values(data);
    
    const setClause = keys.map(key => `${key} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${setClause} WHERE id = ?`;
    
    values.push(id);
    await query(sql, values);
    
    return {
      id,
      ...data
    };
  },

  delete: async (table, id) => {
    const sql = `DELETE FROM ${table} WHERE id = ?`;
    const result = await query(sql, [id]);
    return result.affectedRows > 0;
  },

  // Specific operations
  findByEmail: async (table, email) => {
    const sql = `SELECT * FROM ${table} WHERE email = ?`;
    const results = await query(sql, [email]);
    return results[0];
  }
};

module.exports = {
  pool,
  testConnection,
  query,
  ...dbOperations
}; 