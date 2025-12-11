const express = require('express');
const { ensureAuthenticatedApi } = require('../middlewares/auth');
const Course = require('../models/Course');

const router = express.Router();

// 사용자 강의 시간표를 반환하는 API
router.get('/', ensureAuthenticatedApi, async (req, res) => {
  try {
    const courses = await Course.getCoursesByUserId(req.user.id);
    res.json(courses);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '서버 오류' });
  }
});

module.exports = router;
