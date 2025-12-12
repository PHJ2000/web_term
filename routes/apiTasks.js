const express = require('express');
const { ensureAuthenticatedApi } = require('../middlewares/auth');
const Task = require('../models/Task');
const Course = require('../models/Course');

const router = express.Router();

// 날짜를 YYYY-MM-DD 문자열로 변환
function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 모든 작업 목록을 반환하는 API
router.get('/', ensureAuthenticatedApi, async (req, res) => {
  try {
    const tasks = await Task.getTasksByUserId(req.user.id);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 오늘 마감 작업 반환 API
router.get('/today', ensureAuthenticatedApi, async (req, res) => {
  const today = formatDate(new Date());
  try {
    const tasks = await Task.getTasksByUserIdAndDate(req.user.id, today);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 이번 주 마감 작업 반환 API
router.get('/week', ensureAuthenticatedApi, async (req, res) => {
  const start = formatDate(new Date());
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 7);
  const end = formatDate(endDate);
  try {
    const tasks = await Task.getTasksByUserIdWithinWeek(req.user.id, start, end);
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

// 새 작업을 생성하는 API
router.post('/', ensureAuthenticatedApi, async (req, res) => {
  try {
    const { priority, course_id } = req.body;
    const parsedPriority = Number(priority);
    const normalizedPriority =
      priority === undefined || priority === ''
        ? 2
        : Number.isInteger(parsedPriority) && parsedPriority >= 1 && parsedPriority <= 3
        ? parsedPriority
        : null;
    if (normalizedPriority === null) {
      return res.status(400).json({ error: 'Invalid priority' });
    }

    let normalizedCourseId = null;
    if (course_id !== undefined && course_id !== null && course_id !== '') {
      const parsedCourseId = Number(course_id);
      if (!Number.isInteger(parsedCourseId)) {
        return res.status(400).json({ error: 'Invalid course_id' });
      }
      // 소유 강의인지 확인해 다른 사용자 강의를 막음
      const isOwned = await Course.isCourseOwnedByUser(parsedCourseId, req.user.id);
      if (!isOwned) {
        return res.status(400).json({ error: 'Invalid course_id' });
      }
      normalizedCourseId = parsedCourseId;
    }

    const id = await Task.createTask(req.user.id, {
      ...req.body,
      priority: normalizedPriority,
      course_id: normalizedCourseId
    });
    res.status(201).json({ id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '생성 실패' });
  }
});

// 작업 상태를 수정하는 API
router.patch('/:id', ensureAuthenticatedApi, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (status !== 'pending' && status !== 'done') {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const affectedRows = await Task.updateTaskStatus(id, req.user.id, status);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '수정 실패' });
  }
});

// 작업 삭제 API (선택 기능)
router.delete('/:id', ensureAuthenticatedApi, async (req, res) => {
  const { id } = req.params;
  try {
    const affectedRows = await Task.deleteTask(id, req.user.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
