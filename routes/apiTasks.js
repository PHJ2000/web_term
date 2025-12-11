const express = require('express');
const { ensureAuthenticatedApi } = require('../middlewares/auth');
const Task = require('../models/Task');

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
    const id = await Task.createTask(req.user.id, req.body);
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
  if (!status) {
    return res.status(400).json({ error: 'status 필드가 필요합니다.' });
  }
  try {
    await Task.updateTaskStatus(id, req.user.id, status);
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
    await Task.deleteTask(id, req.user.id);
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '삭제 실패' });
  }
});

module.exports = router;
