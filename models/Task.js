const db = require('../config/db');

// 사용자 모든 작업 조회
async function getTasksByUserId(userId) {
  const [rows] = await db.query(
    `SELECT t.*, DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date, c.name AS course_name
     FROM tasks t
     LEFT JOIN courses c ON t.course_id = c.id
     WHERE t.user_id = ?
     ORDER BY t.due_date ASC, t.priority ASC`,
    [userId]
  );
  return rows;
}

// 특정 날짜 작업 조회
async function getTasksByUserIdAndDate(userId, date) {
  const [rows] = await db.query(
    `SELECT t.*, DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date, c.name AS course_name
     FROM tasks t
     LEFT JOIN courses c ON t.course_id = c.id
     WHERE t.user_id = ? AND t.due_date = ? AND t.status = 'pending'
     ORDER BY t.due_date ASC, t.priority ASC`,
    [userId, date]
  );
  return rows;
}

// 주간 범위 작업 조회
async function getTasksByUserIdWithinWeek(userId, startDate, endDate) {
  const [rows] = await db.query(
    `SELECT t.*, DATE_FORMAT(t.due_date, '%Y-%m-%d') AS due_date, c.name AS course_name
     FROM tasks t
     LEFT JOIN courses c ON t.course_id = c.id
     WHERE t.user_id = ? AND t.due_date BETWEEN ? AND ? AND t.status = 'pending'
     ORDER BY t.due_date ASC, t.priority ASC`,
    [userId, startDate, endDate]
  );
  return rows;
}

// 작업 생성
async function createTask(userId, taskData) {
  const { title, description, due_date, priority, course_id } = taskData;
  const [result] = await db.query(
    'INSERT INTO tasks (user_id, course_id, title, description, due_date, priority) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, course_id || null, title, description, due_date, priority || 2]
  );
  return result.insertId;
}

// 상태 업데이트
async function updateTaskStatus(id, userId, status) {
  await db.query('UPDATE tasks SET status = ? WHERE id = ? AND user_id = ?', [
    status,
    id,
    userId
  ]);
}

// 작업 삭제 (선택 기능)
async function deleteTask(id, userId) {
  await db.query('DELETE FROM tasks WHERE id = ? AND user_id = ?', [id, userId]);
}

module.exports = {
  getTasksByUserId,
  getTasksByUserIdAndDate,
  getTasksByUserIdWithinWeek,
  createTask,
  updateTaskStatus,
  deleteTask
};
