const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/User');

module.exports = function (passport) {
  // 로컬 전략 설정 (이메일/비밀번호)
  passport.use(
    new LocalStrategy(
      { usernameField: 'email' },
      async (email, password, done) => {
        try {
          const user = await User.findByEmail(email);
          if (!user) {
            return done(null, false, { message: '이메일을 찾을 수 없습니다.' });
          }
          const isMatch = await bcrypt.compare(password, user.password_hash);
          if (!isMatch) {
            return done(null, false, { message: '비밀번호가 올바르지 않습니다.' });
          }
          return done(null, user);
        } catch (err) {
          return done(err);
        }
      }
    )
  );

  // 사용자 직렬화 (세션에 사용자 id 저장)
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // 사용자 역직렬화 (id로 DB 조회)
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
