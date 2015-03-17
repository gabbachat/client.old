'use strict';

module.exports = function () {

  var $       = require('jquery-browserify'),
        Browser    = require('../_modules/browser'),
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

      $.ajax({
        url : Room.avatarRoot + 'users/' + data.from + '.png',
        type : 'HEAD',
        error: function() {

          var html = '<div class="message" style="opacity:0">';
          html = html + '<img src="../../img/avatars/users/default.png" class="avatar">';
          html = html + '<div class="from">' + data.from + '</div>';
          html = html + '<div class="text">' + data.msg + '</div>';
          html = html + '</div>';

          $('section.messages').append( html );
          $('.messages').animate({ scrollTop: $('.messages').height()}, 1000);
          $('img').animate({opacity: 1}, 500 );

          $('.message').animate({opacity: 1}, 500 );


        },
        success: function() {

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

          var currentdate = new Date();

          var timestamp = currentdate.getHours() + ':' + currentdate.getMinutes();

          // var datetime = 'Last Sync: ' + currentdate.getDate() + '/'
          //       + (currentdate.getMonth()+1)  + '/'
          //       + currentdate.getFullYear() + ' @ '
          //       + currentdate.getHours() + ':'
          //       + currentdate.getMinutes() + ':'
          //       + currentdate.getSeconds();

          var html = '<div class="message" style="opacity:0">';
          html = html + '<img src="../../img/avatars/users/' + data.from + '.png" class="avatar">';
          html = html + '<div class="from">' + data.from + ' &bull; sent at ' + formatAMPM(new Date()) + '</div>';
          html = html + '<div class="text">' + data.msg + '</div>';
          html = html + '</div>';

          $('section.messages').append( html );
          $('.messages').animate({ scrollTop: $('.messages').height()}, 1000);
          $('img').animate({opacity: 1}, 500 );

          $('.message').animate({opacity: 1}, 500 );

        }
      });

    },

    // WHEN ROOM HAS BEEN JOINED
    success : function () {

      var Room = this;

      socket.on('room:success', function( data ) {
        localStorage.setItem('currentRoom', data.room );
        Room.receiveMessage(data.room);

        // SET UPPER USER AVATAR
        Room.setImage(
          'users/' + data.handle + '.png',
          'users/default.png',
          $('.rooms .user .avatar')
        );

        // SET LOWER AVATAR
        Room.setImage(
          'users/' + data.handle + '.png',
          'users/default.png',
          $('.footer .avatar')
        );

        // SET ROOM AVATAR
        Room.setImage(
          'rooms/' + data.room + '.png',
          'rooms/default.png',
          $('.header .channel-avatar')
        );

        $('.rooms .user .user-name').html( localStorage.getItem('_id') );
        $('.rooms .user .user-handle').html( '@' + localStorage.getItem('_id') );

        $('.public-groups li').removeClass('selected');

        $('.public-groups li').each(function() {

          if ( $(this).data('name') === data.room ) {
            $(this).addClass('selected');
          }
        });

        // SET CURRENT ROOM

      });


    },


    // WHEN NEW USER LOGS IN
    welcome : function () {

      var Room = this;

      socket.on('room:welcome', function( data ) {

        $('.active-users ul li').each(function() {
          if ( $(this).data('handle') === data.handle ) $(this).remove();
        });

        $('.active-users ul').append('<li data-handle="' + data.handle + '">' + data.handle + '</li>');

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

      var Room = this;

      socket.on( room + ':message', function( data ) {
        Room.setMessageImage(data);
      });
    }

  };

};
