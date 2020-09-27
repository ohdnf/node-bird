const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

const User = require('../models/user');

module.exports = () => {
  passport.use(new LocalStrategy({
    // 로그인 라우터의 req.body 속성명인 email, password
    usernameField: 'email',
    passwordField: 'password',
  }, async (email, password, done) => {
    /**
     * email <== usernameField
     * password <== passwordField
     * done ==> passport.authenticate의 콜백 함수
     */
    try {
      const exUser = await User.findOne({ where: { email } });  // 사용자 확인
      if (exUser) {
        const result = await bcrypt.compare(password, exUser.password); // 비밀번호 확인
        if (result) {
          done(null, exUser);
          /**
           * 로그인 성공 시                  done(null, exUser);
           *                                      V      V
           * passport.authenticate('local', (authError, user, info) => {
           * 콜백 함수에서 나머지 로직 실행
           */
        } else {
          done(null, false, { message: '비밀번호가 일치하지 않습니다.' });
        }
      } else {
        done(null, false, { message: '가입되지 않은 회원입니다.' });
      }
    } catch (error) {
      console.error(error);
      done(error);
    }
  }));
};