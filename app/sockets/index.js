'use strict';

module.exports = function (app, session) {

  const io = require('socket.io')(app.server),
        pog = app.pog,
        colors = require('colors');

  // ANNOUNCE THAT SOCKETS ARE ENABLED
  app.log('INFO: '.blue + 'enabling ' + 'socket.io'.yellow + ' server');

  // ON CONNECTION
  io.on('connection', function (socket){

  });


};
