'use strict';

module.exports = function () {

  const port = window.location.port,
        protocol = window.location.protocol + '//',
        host = window.location.hostname;

  return {

    init : function ( server ) {

      let Socket = window.socket = io.connect( server );


      Socket.on('connected', function( data ) {
        console.log('socket connected with id ' + data.id);
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
