module.exports = function( app ) {

  console.log('github callback: ' + app.address + app.config.passport.github.callback);

  var passport = require('koa-passport');

  var Github = require('passport-github').Strategy;
  passport.use(new Github({
      clientID: app.config.passport.github.key,
      clientSecret: app.config.passport.github.secret,
      callbackURL: app.address + app.config.passport.github.callback
    },
    function(token, tokenSecret, profile, done) {
      app.session.token = token;
      app.session.secret = tokenSecret;
      done(null, profile);
    }
  ));

  // AUTHENTICATE
  app.router.get('/auth/github',
    passport.authenticate('github')
  );

  // CALLBACK
  app.router.get('/auth/github/callback',
    passport.authenticate('github', {
      successRedirect: '/chat',
      // failureRedirect: '/login',
      flashFailure: true
    })
  );

};
