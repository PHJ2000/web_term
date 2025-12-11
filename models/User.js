const db = require('../config/db');

// 이메일로 사용자 조회
async function findByEmail(email) {
  const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0] || null;
}

// id로 사용자 조회
async function findById(id) {
  const [rows] = await db.query('SELECT * FROM users WHERE id = ?', [id]);
  return rows[0] || null;
}

// 새 사용자 생성
async function createUser({ email, name, passwordHash }) {
  const [result] = await db.query(
    'INSERT INTO users (email, name, password_hash) VALUES (?, ?, ?)',
    [email, name, passwordHash]
  );
  return result.insertId;
}

module.exports = {
  findByEmail,
  findById,
  createUser
};
