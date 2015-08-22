module.exports = (app) ->

  # REQUIRE
  passport = require('koa-passport')
  Facebook = require('passport-facebook').Strategy

  # CONFIGURE
  passport.use new Facebook({
    clientID: app.config.passport.facebook.key
    clientSecret: app.config.passport.facebook.secret
    callbackURL: app.address + app.config.passport.facebook.callback
  }, (token, tokenSecret, profile, done) ->
    app.session.token = token
    app.session.secret = tokenSecret
    done null, profile
    return
  )

  # AUTHENTICATE
  app.router.get '/auth/facebook', passport.authenticate('facebook')

  # CALLBACK
  app.router.get '/auth/facebook/callback',
    passport.authenticate('facebook',
      successRedirect: '/chat'
      failureRedirect: '/login')

  return
