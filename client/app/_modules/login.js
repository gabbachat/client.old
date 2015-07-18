'use strict';

module.exports = function () {

  const Socket = window.socket;

  return {

    init : function ( server ) {

      console.log('login.init');

      this.socket = window.socket = io.connect( server );

      this.socket.emit('user:login', { user: 'jesseweed' });

      // WHEN USER CONNECTS
      this.socket.on('user:connected', function( data ) {
        console.log('user connected:');
        console.log(data);
      });

    },


    process : function ( email, user, room_id ) {
      console.log('Gabba.Login.process');

      // window.socket.emit('user:login', { email : email, user_id : user, room_id : room_id });

    },


  };

};
