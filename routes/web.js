const express = require('express');
const { ensureAuthenticated } = require('../middlewares/auth');
const Task = require('../models/Task');
const Course = require('../models/Course');

const router = express.Router();

// 날짜를 YYYY-MM-DD 문자열로 변환하는 헬퍼
function formatDate(date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// 루트: 로그인 여부에 따라 대시보드/로그인으로 보냄
router.get('/', (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.redirect('/dashboard');
  }
  return res.redirect('/auth/login');
});

// 대시보드 페이지: 오늘/이번 주 할 일 조회
router.get('/dashboard', ensureAuthenticated, async (req, res) => {
  const today = new Date();
  const todayStr = formatDate(today);
  const weekEnd = new Date();
  weekEnd.setDate(weekEnd.getDate() + 7);
  const weekEndStr = formatDate(weekEnd);

  try {
    const todayTasks = await Task.getTasksByUserIdAndDate(req.user.id, todayStr);
    const weekTasks = await Task.getTasksByUserIdWithinWeek(
      req.user.id,
      todayStr,
      weekEndStr
    );
    res.render('dashboard', { todayTasks, weekTasks });
  } catch (err) {
    console.error(err);
    req.flash('error', '대시보드를 불러오지 못했습니다.');
    res.render('dashboard', { todayTasks: [], weekTasks: [] });
  }
});

// 강의 목록 페이지
router.get('/courses', ensureAuthenticated, async (req, res) => {
  try {
    const courses = await Course.getCoursesByUserId(req.user.id);
    res.render('courses', { courses });
  } catch (err) {
    console.error(err);
    req.flash('error', '강의 목록을 불러오지 못했습니다.');
    res.render('courses', { courses: [] });
  }
});

// 강의 추가 처리
router.post('/courses', ensureAuthenticated, async (req, res) => {
  const { name, professor, day_of_week, start_time, end_time } = req.body;
  if (!name) {
    req.flash('error', '강의명을 입력하세요.');
    return res.redirect('/courses');
  }
  try {
    await Course.createCourse(req.user.id, {
      name,
      professor,
      day_of_week: day_of_week || null,
      start_time: start_time || null,
      end_time: end_time || null
    });
    req.flash('success', '강의가 추가되었습니다.');
    res.redirect('/courses');
  } catch (err) {
    console.error(err);
    req.flash('error', '강의를 추가하지 못했습니다.');
    res.redirect('/courses');
  }
});

// 전체 작업 목록 페이지
router.get('/tasks', ensureAuthenticated, async (req, res) => {
  try {
    const [tasks, courses] = await Promise.all([
      Task.getTasksByUserId(req.user.id),
      Course.getCoursesByUserId(req.user.id)
    ]);
    res.render('tasks', { tasks, courses });
  } catch (err) {
    console.error(err);
    req.flash('error', '작업 목록을 불러오지 못했습니다.');
    res.render('tasks', { tasks: [], courses: [] });
  }
});

// 작업 추가 처리
router.post('/tasks', ensureAuthenticated, async (req, res) => {
  const { title, description, due_date, priority, course_id } = req.body;
  if (!title) {
    req.flash('error', '제목을 입력하세요.');
    return res.redirect('/tasks');
  }
  try {
    await Task.createTask(req.user.id, {
      title,
      description,
      due_date: due_date || null,
      priority: priority || 2,
      course_id: course_id || null
    });
    req.flash('success', '작업이 추가되었습니다.');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error', '작업을 추가하지 못했습니다.');
    res.redirect('/tasks');
  }
});

// 작업 완료 처리
router.post('/tasks/:id/complete', ensureAuthenticated, async (req, res) => {
  const { id } = req.params;
  try {
    await Task.updateTaskStatus(id, req.user.id, 'done');
    req.flash('success', '작업을 완료했습니다.');
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    req.flash('error', '상태를 변경하지 못했습니다.');
    res.redirect('/tasks');
  }
});

module.exports = router;
