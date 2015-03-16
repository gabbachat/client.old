'use strict';

const koa    = require('koa'),
      app      = koa();
      app.base = __dirname;

require('colors'); // PRETTY CONSOLE LOGGING
require('fs'); // FILE SYSTEM
require(__dirname + '/config/_settings')(app); // MAIN APP SETTINGS
process.env.NODE_ENV = process.env.NODE_ENV || 'development'; // SET DEFAULT ENVIRONMENT

let pog = app.pog = require('./lib/pog')(app); // INCLUDE POG LIB
app.log = pog.log;
pog.inform(app, 'start'); // START UP MESSAGE


// REQUIRED SETTINGS & CONFIG FILES
require(__dirname + '/config/environment/' + process.env.NODE_ENV)(app); // ENVIRONMENT SPECIFIC SETTINGS
require(__dirname + '/config/server')(app, pog); // VIEW SETTINGS

app.pog = pog; // ADD POG OBJECT TO APP

require('./app/routes')(app); // LOAD ANY CUSTOM ROUTES

if ( app.config.autoRouter === true ) {
  app.use(require('pog-router')); // INCLUDE AUTO ROUTER
}

// START THE APP BY LISTENING ON <PORT>
app.server = app.listen( process.env.PORT || app.config.port, function( err ) {

  if ( !err ) { // IF THERE'S NO ERRORS

    // ENABLE SOCKET.IO
    if (app.config.sockets === true ) require('./app/sockets')(app);

    // TELL EVRYTHING IS GOOD TO GO
    pog.inform(app, 'done');

  } else { // IF SOMETHING WENT WRONG!
    pog.inform(app, 'error', err);
  }

});
