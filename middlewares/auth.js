// 로그인 여부 확인 미들웨어 (페이지용)
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.redirect('/auth/login');
}

// 로그인 여부 확인 미들웨어 (API용, JSON 응답)
function ensureAuthenticatedApi(req, res, next) {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return next();
  }
  return res.status(401).json({ error: 'Unauthorized' });
}

module.exports = {
  ensureAuthenticated,
  ensureAuthenticatedApi
};
