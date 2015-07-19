'use strict';

module.exports = function () {

  const port = window.location.port,
        protocol = window.location.protocol + '//',
        host = window.location.hostname,
        User = require('./user')();

  return {

    init : function ( server ) {

      let Socket = window.socket = io.connect( server );

      // let Socket = window.socket;

      console.log('CONNECT TO: ' + server);

      Socket.on('connected', function( data ) {
        console.log('socket connected: ' + data.connected);
        console.log('socket id: ' + data.id);
        // console.log(data.connected);
        // console.log(Socket);
        User.init();
      });

      Socket.on('error', function( data ) {
        console.log('socket error: ');
        console.error(data);
      });

      require('../router').init(); // INITIALIZE ROUTER


    },

    config : {  // GLOBAL CONFIG SETTINGS

      // SET TO FALSE TO DISABLE LOGGING TO CONSOLE
      debug : true,

      // BASE URL'S
      url : {
          base: protocol + host + ( port !== '' ? ':' + port : '') + '/', //BASE URL
      }

    } // END CONFIG

  };

};
