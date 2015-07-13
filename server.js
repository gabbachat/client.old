'use strict';

const koa      = require('koa'),
      app      = koa();
      app.base = __dirname;

require('colors'); // PRETTY CONSOLE LOGGING
require('fs'); // FILE SYSTEM
require(__dirname + '/_config/pog')(app); // MAIN APP SETTINGS
process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // SET DEFAULT ENVIRONMENT

let pog = app.pog = require('./server/lib/pog')(app); // INCLUDE POG LIB
app.log = pog.log;
pog.inform(app, 'start'); // START UP MESSAGE

// REQUIRED SETTINGS & CONFIG FILES
require(__dirname + '/_config/environment/' + process.env.NODE_ENV)(app); // ENVIRONMENT SPECIFIC SETTINGS
require(__dirname + '/_config/server')(app, pog); // VIEW SETTINGS

require('./server/routes')(app); // LOAD ROUTER

// START THE APP BY LISTENING ON <PORT>
app.server = app.listen( process.env.PORT || app.config.port, function( err ) {
  if ( !err ) { // IF THERE'S NO ERRORS
    pog.inform(app, 'done');
  } else { // IF SOMETHING WENT WRONG!
    pog.inform(app, 'error', err);
  }
});
