'use strict';

const koa      = require('koa'),
      app      = koa();
      app.base = __dirname;

require('colors'); // PRETTY CONSOLE LOGGING
require('fs'); // FILE SYSTEM
require('coffee-script').register();
require(__dirname + '/_config/gabba.coffee')(app); // MAIN APP SETTINGS
process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // SET DEFAULT ENVIRONMENT


let gabba = app.gabba = require('./lib/gabba')(app); // INCLUDE gabba LIB
app.log = gabba.log;
gabba.inform(app, 'start'); // START UP MESSAGE

// REQUIRED SETTINGS & CONFIG FILES
require(__dirname + '/_config/environment/' + process.env.NODE_ENV)(app); // ENVIRONMENT SPECIFIC SETTINGS
require(__dirname + '/_config/server')(app, gabba); // VIEW SETTINGS

// WATERLINE
var config = require( __dirname + '/_config/db')( app ),
    Waterline = require('waterline'),
    orm = new Waterline();

    orm.loadCollection(require( __dirname + '/app/models/user')(app)); // LOAD RECEIPT MODEL

// CONNECT TO DB
orm.initialize(config, function(err, models) {

  if ( err ) {
    console.log('ERROR CONNCTING TO DB');
    console.log(err);
    gabba.inform(app, 'error', err);
  } else {
    console.log('db connected');
    app.models = models.collections;
    app.connections = models.connections;

    require('./app/routes/passport')(app); // PASSPORT
    require('./app/routes/index')(app); // LOAD ROUTES

    // START THE APP BY LISTENING ON <PORT>
    app.server = app.listen( process.env.PORT || app.config.port, function( err ) {
      if ( !err ) { // IF THERE'S NO ERRORS
        gabba.inform(app, 'done');
      } else { // IF SOMETHING WENT WRONG!
        gabba.inform(app, 'error', err);
      }
    });
  }

});
