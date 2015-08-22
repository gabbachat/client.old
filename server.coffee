require('coffee-script').register()

koa = require('koa')
app = koa()
app.base = __dirname

require 'colors' # PRETTY CONSOLE LOGGING
require 'fs' # FILE SYSTEM
require(__dirname + '/_config/gabba.coffee') app # MAIN APP SETTINGS
process.env.NODE_ENV = process.env.NODE_ENV or 'development' # SET DEFAULT ENVIRONMENT


gabba = app.gabba = require('./lib/gabba')(app) # INCLUDE gabba LIB
app.log = gabba.log
gabba.inform app, 'start' # START UP MESSAGE

# REQUIRED SETTINGS & CONFIG FILES
require(__dirname + '/_config/environment/' + process.env.NODE_ENV) app # ENVIRONMENT SPECIFIC SETTINGS
require(__dirname + '/_config/server') app, gabba # VIEW SETTINGS


# WATERLINE
config = require(__dirname + '/_config/db')(app)
Waterline = require('waterline')
orm = new Waterline

orm.loadCollection(require( __dirname + '/app/models/user')(app)); # LOAD RECEIPT MODEL

# CONNECT TO DB
orm.initialize config, (err, models) ->

  app.models = models.collections;
  app.connections = models.connections;

  if err
    console.log 'ERROR CONNCTING TO DB:'.red
    console.log err
    gabba.inform app, 'error', err

  else
    require('./app/routes/passport') app # PASSPORT
    require('./app/routes') app # LOAD ROUTES

    # START THE APP BY LISTENING ON <PORT>
    app.server = app.listen(process.env.PORT or app.config.port, (err) ->
      if !err # IF THERE'S NO ERRORS
        gabba.inform app, 'done'
      else # IF SOMETHING WENT WRONG!
        gabba.inform app, 'error', err
      return
    )

  return
