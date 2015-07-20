module.exports = function( app ) {

  var passport = require('koa-passport');

  var Twitter = require('passport-twitter').Strategy;
  passport.use(new Twitter({
      consumerKey: app.config.passport.twitter.key,
      consumerSecret: app.config.passport.twitter.secret,
      callbackURL: app.address + app.config.passport.twitter.callback
    },
    function(token, tokenSecret, profile, done) {
      app.session.token = token;
      app.session.secret = tokenSecret;
      done(null, profile);
    }
  ));

  // AUTHENTICATE
  app.router.get('/auth/twitter',
    passport.authenticate('twitter')
  );

  // CALLBACK
  app.router.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/chat',
      failureRedirect: '/login'
    })
  );

};
