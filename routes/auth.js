const express = require('express');
const passport = require('passport');
const bcrypt = require('bcrypt');
const { isLoggedIn, isNotLoggedIn } = require('./middlewares');
const User = require('../models/user');

const router = express.Router();

router.post('/join', isNotLoggedIn, async (req, res, next) => {
  const { email, nick, password } = req.body;
  try {
    const exUser = await User.findOne({ where: { email } });
    if (exUser) {
      return res.redirect('/join?error=exist');
    }
    const hash = await bcrypt.hash(password, 12);
    await User.create({
      email,
      nick,
      password: hash,
    });
    return res.redirect('/');
  } catch (error) {
    console.error(error);
    return next(error);
  }
});

router.post('/login', isNotLoggedIn, (req, res, next) => {
  // 로컬 로그인 전략을 수행하는 미들웨어
  passport.authenticate('local', (authError, user, info) => {
    if (authError) {  // 전략 에러
      console.error(authError);
      return next(authError);
    }
    if (!user) {  // 존재하지 않는 사용자 
      return res.redirect(`/?loginError=${info.message}`);
    }
    return req.login(user, (loginError) => {
      if (loginError) {
        console.error(loginError);
        return next(loginError);
      }
      return res.redirect('/'); // passport.serializeUser 호출 + user 객체 전달
    });
  })(req, res, next); // 미들웨어 내의 미들웨어에는 (req, res, next)를 붙입니다.
});

router.get('/logout', isLoggedIn, (req, res) => {
  req.logout(); // req.user 객체 제거
  req.session.destroy();  // req.session 객체 내용 제거
  res.redirect('/');
});

/**
 * 카카오 로그인은 로그인 성공 시 내부적으로 req.login을 호출하므로
 * passport.authenticate 메서드에 콜백 함수를 제공하지 않는다.
 */
router.get('/kakao', passport.authenticate('kakao'));

router.get('/kakao/callback', passport.authenticate('kakao', {
  failureRedirect: '/',
}), (req, res) => {
  res.redirect('/');
});

module.exports = router;