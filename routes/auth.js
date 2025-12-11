const express = require('express');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const User = require('../models/User');

const router = express.Router();

// 회원가입 화면을 보여주는 라우트
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// 회원가입 처리 라우트
router.post('/register', async (req, res) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (!name || !email || !password || !passwordConfirm) {
    req.flash('error', '모든 필드를 입력하세요.');
    return res.redirect('/auth/register');
  }
  if (password !== passwordConfirm) {
    req.flash('error', '비밀번호가 일치하지 않습니다.');
    return res.redirect('/auth/register');
  }
  try {
    const existing = await User.findByEmail(email);
    if (existing) {
      req.flash('error', '이미 등록된 이메일입니다.');
      return res.redirect('/auth/register');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    await User.createUser({ email, name, passwordHash });
    req.flash('success', '회원가입 완료! 로그인 해주세요.');
    return res.redirect('/auth/login');
  } catch (err) {
    console.error(err);
    req.flash('error', '회원가입 중 오류가 발생했습니다.');
    return res.redirect('/auth/register');
  }
});

// 로그인 화면을 보여주는 라우트
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// 로그인 처리 라우트
router.post(
  '/login',
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/auth/login',
    failureFlash: true
  })
);

// 로그아웃 처리 라우트
router.post('/logout', (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/auth/login');
  });
});

module.exports = router;
