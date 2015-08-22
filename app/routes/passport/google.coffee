module.exports = (app) ->

  # REQUIRE
  passport = require('koa-passport')
  Google = require('passport-google').Strategy

  # CONFIGURE
  passport.use new Google({
    clientID: app.config.passport.google.key
    clientSecret: app.config.passport.google.secret
    callbackURL: app.address + app.config.passport.google.callback
  }, (token, tokenSecret, profile, done) ->
    app.session.token = token
    app.session.secret = tokenSecret
    done null, profile
    return
  )

  # AUTHENTICATE
  app.router.get '/auth/google', passport.authenticate('google')

  # CALLBACK
  app.router.get '/auth/google/callback',
    passport.authenticate('google',
      successRedirect: '/chat'
      failureRedirect: '/login')

  return
