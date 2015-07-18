module.exports = function( app ) {

  var passport = require('koa-passport');

  var Google = require('passport-google').Strategy;
  passport.use(new Google({
      clientID: app.config.passport.google.key,
      clientSecret: app.config.passport.google.secret,
      callbackURL: app.address + app.config.passport.google.callback
    },
    function(token, tokenSecret, profile, done) {
      // retrieve user ...
      done(null, profile);
    }
  ));

  // AUTHENTICATE
  app.router.get('/auth/google',
    passport.authenticate('google')
  );

  // CALLBACK
  app.router.get('/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/chat',
      failureRedirect: '/login'
    })
  );

};
