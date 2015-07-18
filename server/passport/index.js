module.exports = function( app ) {

  const passport = require('koa-passport');

  passport.serializeUser(function(data, done) {

    console.log('serialize');

    app.session.provider = data.provider;
    app.session.passport = data;

    done(null, data);

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
