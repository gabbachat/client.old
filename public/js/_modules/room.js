'use strict';

module.exports = function () {

  var $       = require('jquery-browserify'),
        Browser    = require('../_modules/browser'),
        socket  = window.socket;

  return {

    init : function() {

      this.bind();
      this.welcome();
      this.broadcast();

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
    join : function ( data ) {

      socket.emit('room:join', data);

    },

    fileExists : function (url) {
        var http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status;
    },

    avatarRoot : '../../img/avatars/',

    setImage : function ( img, alt, el ) {

      var Room = this;

      $.ajax({
        url : Room.avatarRoot + img,
        type : 'HEAD',
        error: function() {
          el.attr( 'src', Room.avatarRoot + alt );
          $('img').animate({opacity: 1}, 500 );
        },
        success: function() {
          el.attr( 'src', Room.avatarRoot + img );
          $('img').animate({opacity: 1}, 500 );
        }
      });

    },


    setMessageImage : function ( data ) {

      var Room = this;

      function formatAMPM(date) {
        var hours = date.getHours();
        var minutes = date.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0'+minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }

      $.ajax({
        url : Room.avatarRoot + 'users/' + data.from + '.png',
        type : 'HEAD',
        error: function() {

          var html = '<div class="message" style="opacity:0">';
          html = html + '<img src="../../img/avatars/users/default.png" class="avatar">';
          html = html + '<div class="from">' + data.from + ' &bull; sent at ' + formatAMPM(new Date()) + '</div>';
          html = html + '<div class="text">' + data.msg + '</div>';
          html = html + '</div>';

          $('section.messages').append( html );
          $('.messages').animate({ scrollTop: $('.messages').height()}, 1000);
          $('img').animate({opacity: 1}, 500 );

          $('.message').animate({opacity: 1}, 500 );


        },
        success : function() {

          var html = '<div class="message" style="opacity:0">';
          html = html + '<img src="../../img/avatars/users/' + data.from + '.png" class="avatar">';
          html = html + '<div class="from">' + data.from + ' &bull; sent at ' + formatAMPM(new Date()) + '</div>';
          html = html + '<div class="text">' + data.msg + '</div>';
          html = html + '</div>';

          $('section.messages').append( html );

          // $('.messages').animate({ scrollTop: $('.messages').height()}, 1000);
          $('.messages').animate({ scrollTop: $('.messages')[0].scrollHeight}, 1000);

          $('img').animate({opacity: 1}, 500 );

          $('.message').animate({opacity: 1}, 500 );

        }
      });

    },

    // WHEN ROOM HAS BEEN JOINED
    welcome : function () {

      var Room = this;

      socket.on('room:welcome', function( data ) {

        Room.receiveMessage(data.room_id);

        localStorage.setItem('currentRoom', data.room_id );

        // SET UPPER USER AVATAR
        Room.setImage(
          'users/' + data.user_id + '.png',
          'users/default.png',
          $('.rooms .user .avatar')
        );

        // SET LOWER AVATAR
        Room.setImage(
          'users/' + data.user_id + '.png',
          'users/default.png',
          $('.footer .avatar')
        );

        // SET ROOM AVATAR
        Room.setImage(
          'rooms/' + data.room_id + '.png',
          'rooms/default.png',
          $('.header .channel-avatar')
        );

        $('.rooms .user .user-name').html( data.name );
        $('.rooms .user .user-handle').html( '@' + data.user_id );

        $('.public-groups li').removeClass('selected');

        $('.public-groups li').each(function() {

          if ( $(this).data('name') === data.room_id ) {
            $(this).addClass('selected');
          }
        });

        // SET CURRENT ROOM

      });


    },


    // WHEN NEW USER LOGS IN
    broadcast : function () {

      var Room = this;

      socket.on('room:broadcast', function( data ) {

        console.log('room:broadcast');


      });


    },


    updateUserList : function ( data ) {

      var Room = this;

      console.log('update room list');

      $('.active-users ul').fadeOut()
      .html('');

      $.each(data, function() {

        var current_room = localStorage.getItem('currentRoom'),
            status = ' class="online"',
            user = this;

        if ( user.logged_in === false ) status = ' class="offline"';

        // $('.active-users ul li').each(function() {
          if ( user.room_id === localStorage.getItem('currentRoom')) {

            if (!user.name) user.name = user.user_id;

            var el = $('.active-users ul').append('<li' + status + ' data-user_id="' + user.user_id + '" data-room_id="' + user.room_id + '">' + user.name + '</li>').fadeIn();

          }
        // });

      });




    },

    updateUserRoomList : function ( data ) {

      var Room = this;

      console.log('update users in ' + localStorage.getItem('currentRoom'));

      $('.active-users ul li').each(function() {
        if ( $(this).data('room_id') !== localStorage.getItem('currentRoom')) {
          console.log( $(this).data('user_id') + ' is no longer in room');
          $(this).addClass('offline');
        }
      });

    },

    sendMessage : function ( room, msg ) {
      socket.emit('message:broadcast', {
        room : room,
        msg : msg,
        user : localStorage.getItem('user_id')
      });
    },

    receiveMessage : function ( room ) {

      var Room = this;

      socket.on( room + ':message', function( data ) {
        Room.setMessageImage(data);
      });
    }

  };

};
