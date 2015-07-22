'use strict';

window.Gabba = {

    init : function ( server ) {

      let Socket = window.socket = io.connect( server );

      Socket.on('connected', function( data ) {
        console.log('socket connected with id ' + data.id);
      });

      Socket.on('error', function( data ) {
        console.log('socket error: ');
        console.error(data);
      });

      require('./router').init(); // INITIALIZE ROUTER

    }

};
