const { Pool } = require('pg');

const pool = new Pool({
  user: 'database_user',
  host: 'localhost',
  database: 'database_name',
  password: 'database_password',
  port: 5432,
});

module.exports = {
  query: (text, params, callback) => {
    return pool.query(text, params, callback);
  },
};