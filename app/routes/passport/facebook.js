module.exports = function( app ) {

  console.log('facebook callback: ' + app.address + app.config.passport.facebook.callback);

  var passport = require('koa-passport');

  var Facebook = require('passport-facebook').Strategy;
  passport.use(new Facebook({
      clientID: app.config.passport.facebook.key,
      clientSecret: app.config.passport.facebook.secret,
      callbackURL: app.address + app.config.passport.facebook.callback
    },
    function(token, tokenSecret, profile, done) {
      // retrieve user ...
      done(null, profile);
    }
  ));

  // AUTHENTICATE
  app.router.get('/auth/facebook',
    passport.authenticate('facebook')
  );

  // CALLBACK
  app.router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/chat',
      failureRedirect: '/login'
    })
  );

};
