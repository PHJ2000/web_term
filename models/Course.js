const db = require('../config/db');

// 사용자별 모든 강의 조회
async function getCoursesByUserId(userId) {
  const [rows] = await db.query(
    'SELECT * FROM courses WHERE user_id = ? ORDER BY day_of_week, start_time',
    [userId]
  );
  return rows;
}

// 강의 생성
async function createCourse(userId, courseData) {
  const { name, professor, day_of_week, start_time, end_time } = courseData;
  const [result] = await db.query(
    'INSERT INTO courses (user_id, name, professor, day_of_week, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, professor, day_of_week, start_time, end_time]
  );
  return result.insertId;
}

// 강의 삭제 (선택 기능)
async function deleteCourse(id, userId) {
  await db.query('DELETE FROM courses WHERE id = ? AND user_id = ?', [id, userId]);
}

// 특정 강의가 사용자 소유인지 확인
async function isCourseOwnedByUser(courseId, userId) {
  const [rows] = await db.query('SELECT 1 FROM courses WHERE id = ? AND user_id = ?', [
    courseId,
    userId
  ]);
  return rows.length > 0;
}

module.exports = {
  getCoursesByUserId,
  createCourse,
  deleteCourse,
  isCourseOwnedByUser
};
