'use strict';

module.exports = function () {

  const port = window.location.port,
      protocol = window.location.protocol + '//',
      host = window.location.hostname;

  return {

    init : function ( server ) {

      this.socket = window.socket = io.connect( server );

      this.socket.on('connected', function( data ) {
        console.log('connected: ');
        console.log(data.connected);
      });

      this.socket.on('error', function( data ) {
        console.log('Socket Error');
        console.error(data.err);
      });

      require('../_modules/user')().init();
      require('../_modules/room')().init();

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
