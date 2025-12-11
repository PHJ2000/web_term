const mysql = require('mysql2');
const dotenv = require('dotenv');

// 환경변수 로드
dotenv.config();

// mysql2 풀 생성 (promise 기반)
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool.promise();
