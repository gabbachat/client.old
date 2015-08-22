module.exports = (app) ->

  # REQUIRE
  passport = require('koa-passport')
  Github = require('passport-github').Strategy

  # CONFIGURE
  passport.use new Github({
    clientID: app.config.passport.github.key
    clientSecret: app.config.passport.github.secret
    callbackURL: app.address + app.config.passport.github.callback
  }, (token, tokenSecret, profile, done) ->
    app.session.token = token
    app.session.secret = tokenSecret
    done null, profile
    return
  )

  # AUTHENTICATE
  app.router.get '/auth/github', passport.authenticate('github')

  # CALLBACK
  app.router.get '/auth/github/callback',
    passport.authenticate('github',
      successRedirect: '/chat'
      flashFailure: true)

  return
