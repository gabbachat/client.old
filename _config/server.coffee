module.exports = (app) ->

  passport = require('koa-passport')

  # >  - - - - - - - - <
  # >  CSS PROCESSOR   <
  # >  - - - - - - - - <
  app.log 'INFO: '.blue + 'using ' + 'stylus'.yellow + ' for css'

  # >  - - - - - - - - <
  # >  HTML TEMPLATES  <
  # >  - - - - - - - - <
  app.log 'INFO: '.blue + 'rendering templates with ' + 'jade'.yellow

  app.use require('koa-jade').middleware(
    viewPath: app.dir.views
    debug: app.config.debug
    cache: app.config.cache
    pretty: app.config.prettify.html
    compileDebug: app.config.debug
    basedir: app.base)


  # >  - - - - - - - - <
  # >  MISCELLANEOUS   <
  # >  - - - - - - - - <

  # GZIP
  if app.config.gzip == true
    app.use require('koa-gzip')()

  # ENABLE POLYFILLS
  if app.config.polyfills == true
    app.use require('koa-polyfills')()

  # ENABLE CORS
  if app.config.cors == true
    app.use require('koa-cors')()

  app.use require('koa-static')(app.dir.public) # SERVE STATIC FILES
  app.keys = [ process.env.SECRET or app.config.secret ] # SET OUR KEYS
  app.use require('koa-generic-session')(store: require('koa-redis')()) # USE REDIS FOR SESSION STORAGE

  # MAKE SESSION DATA AVAILABLE TO APP
  app.use (next) ->
    app.session = @session
    yield next;
    return

  # ENABLE PASSPORT
  app.use passport.initialize()
  app.use passport.session()

  # ENABLE ROUTER
  app.router = require('koa-router')()
  app.use app.router.routes()

  return
