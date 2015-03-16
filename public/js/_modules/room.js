'use strict';

module.exports = function () {

  const $       = require('jquery-browserify'),
        socket  = window.socket;

  return {

    init : function() {

      this.bind();
      this.success();
      this.welcome();

    },

    bind : function() {

      var Room = this;

      // LOGIN WHEN USER PRESSE ENTER KEY
      $('#user-input').on('keyup', function(e) {
        if ( e.keyCode === 13 ) {
          Room.sendMessage( localStorage.getItem('currentRoom'), $(this).val() );
          $(this).val('');
        }
      });

    },

    // REQUEST TO JOIN A ROOM
    join : function ( handle, room ) {

      console.log('joined ' + room + ' as ' + handle);

      socket.emit('room:join', { user : handle, room : room });

    },

    // WHEN ROOM HAS BEEN JOINED
    success : function () {

      var Room = this;

      socket.on('room:success', function( data ) {
        localStorage.setItem('currentRoom', data.room );
        Room.receiveMessage(data.room);
      });


    },


    // WHEN NEW USER LOGS IN
    welcome : function () {

      var Room = this;

      socket.on('room:welcome', function( data ) {

        if ( data.handle !== localStorage.getItem('_id') ) {
          var html = '<div class="message new-user">';
          html = html + '<div class="join">' + data.handle + ' has joined the room</div>';
          html = html + '</div>';

          $('section.messages').append( html );
        }

      });


    },

    sendMessage : function ( room, msg ) {
      socket.emit('message:send', {
        room : room,
        msg : msg,
        user : localStorage.getItem('_id')
      });
    },

    receiveMessage : function ( room ) {

      socket.on( room + ':message', function( data ) {

        var html = '<div class="message">';
        html = html + '<div class="from">' + data.from + '</div>';
        html = html + '<div class="text">' + data.msg + '</div>';
        html = html + '</div>';

        $('section.messages').append( html );

        $('.messages').animate({ scrollTop: $('.messages').height()}, 1000);


      });
    }

  };

};
