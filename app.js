const path = require('path');
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const dotenv = require('dotenv');
const expressLayouts = require('express-ejs-layouts');

// 환경변수 로드
dotenv.config();

if (!process.env.SESSION_SECRET) {
  throw new Error('SESSION_SECRET 환경변수를 설정해야 서버가 시작됩니다.');
}

const app = express();
const port = process.env.PORT || 3000;

// Passport 설정 불러오기
require('./config/passport')(passport);

// 기본 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// 세션 설정
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
  })
);

// 플래시 메시지 및 Passport 초기화
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

// EJS 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layout');
app.use(expressLayouts);

// 템플릿에서 사용자/메시지 접근 가능하도록 설정
app.use((req, res, next) => {
  res.locals.user = req.user;
  res.locals.messages = {
    success: req.flash('success'),
    error: req.flash('error')
  };
  next();
});

// 라우트 등록
app.use('/auth', require('./routes/auth'));
app.use('/api/tasks', require('./routes/apiTasks'));
app.use('/api/timetable', require('./routes/apiTimetable'));
app.use('/', require('./routes/web'));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
