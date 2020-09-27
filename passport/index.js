const passport = require('passport');
const local = require('./localStrategy');
const kakao = require('./kakaoStrategy');
const User = require('../models/user');

module.exports = () => {
  /**
   * 로그인 시 실행, req.session 객체에 어떤 데이터를 저장할지 설정
   * 현재 done 함수를 통해 user.id를 세션에 저장
   * 아이디만 저장해 세션에 불필요한 정보를 담지 않음
   */
  passport.serializeUser((user, done) => {
    done(null, user.id);  // done(에러 발생 시 처리, 저장하고 싶은 데이터)
  });
  /**
   * 매 요청 시 실행 ==> 캐싱 필요
   * passport.session 미들웨어가 호출
   * serializeUser의 done의 user.id가 deserializer의 매개변수
   * DB에서 사용자 정보 조회 => done(null, user)에서 사용자 정보를 req.user에 저장
   * req.user를 통해 로그인한 사용자 정보 접근 가능
   */
  passport.deserializeUser((id, done) => {
    User.findOne({
      where: { id },
      include: [{
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followers',
      }, {
        model: User,
        attributes: ['id', 'nick'],
        as: 'Followings',
      }],
    })
      .then(user => done(null, user))
      .catch(err => done(err));
  });
  local();
  kakao();
}