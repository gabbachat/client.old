'use strict';

module.exports = function () {

  var $       = require('jquery-browserify'),
      moment       = require('moment'),
      Browser    = require('../_modules/browser'),
      gravatar = require('gravatar'),
      socket  = window.socket;

  return {

    init : function() {

      this.bind();
      this.welcome();
      this.receiveAllMessage();
      // this.broadcast();

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


    renderGroupMessage : function ( data ) {


      var Room = this,
          last,
          html = '';

      $.each(data, function() {
          //
          //
          // var avatar = gravatar.url(this.user.email, {
          //       'size': 200,
          //       'default': 'http://yakk.herokuapp.com/img/avatars/users/default.png'
          //     });

          html = html + '<div class="message" id="message-' + this.msg_id + '" style="opacity:0">';
          html = html + '<img src="' + this.user.avatar + '" class="avatar">';
          html = html + '<div class="from">' + this.user.name;
          html = html + '<span class="date">' + moment(this.createdAt).calendar() + '</span></div>';
          html = html + '<div class="text">' + this.message + '</div>';
          html = html + '</div>';

          last = 'message-' + this.msg_id;

      });

      $('section.messages').append( html );

      $('.messages').animate({
          scrollTop: $('#' + last).offset().top
      }, 500);

      $('img').animate({opacity: 1}, 500 );
      $('.message').animate({opacity: 1}, 800 );


    },


    renderMessage : function ( data ) {

      var Room = this;

      var html = '<div class="message" id="message-' + data.msg_id + '" style="opacity:0">';
      html = html + '<img src="' + data.user.avatar + '" class="avatar">';
      html = html + '<div class="from">' + data.user.name;
      html = html + '<span class="date">' + moment(data.createdAt).calendar() + '</span></div>';
      html = html + '<div class="text">' + data.message + '</div>';
      html = html + '</div>';

      $('section.messages').append( html );

      $('.messages').animate({
          scrollTop: $('#message-' + data.msg_id ).offset().top + 20000
      }, 500);


      $('img').animate({opacity: 1}, 500 );
      $('.message').animate({opacity: 1}, 800 );

    },

    // WHEN ROOM HAS BEEN JOINED
    welcome : function () {

      var Room = this;

      socket.on('room:welcome', function( data ) {

        Room.fetchMessages( data.user_id, data.room_id);

        localStorage.setItem('currentRoom', data.room_id );

        // SET UPPER USER AVATAR
        $('.rooms .user .avatar')
          .attr( 'src', data.avatar )
          .animate({opacity: 1}, 500 );

        // SET LOWER AVATAR

        $('.footer .avatar')
          .attr( 'src', data.avatar )
          .animate({opacity: 1}, 500 );

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


    updateUserList : function ( data ) {

      var Room = this;


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


      $('.active-users ul li').each(function() {
        if ( $(this).data('room_id') !== localStorage.getItem('currentRoom')) {
          $(this).addClass('offline');
        }
      });

    },

    sendMessage : function ( room, msg ) {


      socket.emit('message:send', {
        room_id : room,
        message : msg,
        user_id : localStorage.getItem('user_id'),
        email : localStorage.getItem('email')
      });
    },

    receiveMessage : function ( room ) {

      var Room = this;

      socket.on( room + ':broadcast', function( data ) {
        Room.renderMessage(data);
      });

    },

    receiveAllMessage : function ( room ) {

      var Room = this;



    },

    fetchMessages : function ( user_id, room_id ) {

      var Room = this;


      socket.emit('message:fetchAll', {
        room_id : room_id,
        user_id : user_id
      });

      socket.on( room_id + ':fetchAll', function( data ) {
        // Room.renderMessage(data);

        // $.each(data, function() {
            Room.renderGroupMessage(data);
        // });

      });

      // WHEN A NEW MESSAGE IS RECEIVE
      socket.on( room_id + ':broadcast', function( data ) {
        Room.renderMessage(data);
      });

    }

  };

};
