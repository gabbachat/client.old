'use strict';

module.exports = function (app, session) {

  const io = require('socket.io')(app.server),
        pog = app.pog,
        colors = require('colors');

  // ANNOUNCE THAT SOCKETS ARE ENABLED
  app.log('INFO: '.blue + 'enabling ' + 'socket.io'.yellow + ' server');

  // ON CONNECTION
  io.on('connection', function (socket){

    socket.emit('connect');

    // CONNECT USER
    socket.on('user:login', function(user) {

      let id = user.handle;

      socket.join('yak');
      socket.join('yak:' + id);

      console.log(id + ' connected');

      io.to('yak:' + id).emit('user:connected', {
        handle : id
      });

    });


    // JOIN ROOM
    socket.on('room:join', function(data) {

      let id = data.user,
          room = data.room;
      console.log(id + ' would like to join ' + room);

      socket.join('yak:' + room);
      socket.join('yak:' + room + ':' + id);

      io.to('yak:' + room + ':' + id).emit('room:success', {
        handle : id,
        room : room,
        message : 'Welcome to the ' + room + ' channel!'
      });

      console.log('connected users');
      // var users = io.of();
      console.log( io.sockets.adapter.rooms['yak:' + room] );

      io.to('yak:' + room).emit('room:welcome', {
        handle : id,
        room : room,
        message : 'Welcome to the ' + room + ' channel!'
      });

    });


    socket.on('message:send', function(data) {
      console.log('message received');
      console.log(data);

      var md = require('markdown-it')();
      var message = md.render(data.msg);

      io.to('yak:' + data.room).emit(data.room + ':message', {
        msg: message,
        from: data.user
      });

    });

  });



};
