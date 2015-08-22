module.exports = (app) ->

  passport = require('koa-passport')

  passport.serializeUser (data, done) ->
    app.session.provider = data.provider
    app.session.passport = data
    done null, data
    return

  passport.deserializeUser (user, done) ->
    done null, user
    return

  # LOAD STRATEGIES

  # FACEBOOK
  if app.config.passport.facebook
    require('./facebook') app

  # GITHUB
  if app.config.passport.github
    require('./github') app

  # GOOGLE
  if app.config.passport.google
    require('./google') app

  # TWITTER
  if app.config.passport.twitter
    require('./twitter') app

  return
