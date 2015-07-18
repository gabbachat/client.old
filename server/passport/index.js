module.exports = function( app ) {

  var passport = require('koa-passport');

  passport.serializeUser(function(user, done) {
    console.log('serialize');

    app.session.passport = 'twitter';
    app.session.user = user;

    done(null, user);
  });

  passport.deserializeUser(function(user, done) {
    console.log('deserialize');
    done(null, user);
  });

  if ( app.config.passport.facebook ) { require('./facebook')(app); } // FACEBOOK
  if ( app.config.passport.github ) { require('./github')(app); } // GITHUB
  if ( app.config.passport.google ) { require('./google')(app); } // GOOGLE
  if ( app.config.passport.twitter ) { require('./twitter')(app); } // TWITTER

};
