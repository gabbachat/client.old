'use strict';

module.exports = function () {

  const $       = require('jquery-browserify'),
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

      let Room = this;

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
        let http = new XMLHttpRequest();
        http.open('HEAD', url, false);
        http.send();
        return http.status;
    },

    avatarRoot : '../../img/avatars/',

    setImage : function ( img, alt, el ) {

      let Room = this;

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


      let Room = this,
          last,
          html = '';

      console.log('all messages:');
      console.log(data);

      $.each(data, function() {
        if ( this.message.search('youtube.com') >= 0 || this.message.search('youtu.be') >= 0 ) {
          html = html + '<div class="message" id="message-' + this.msg_id + '" style="opacity:0">';
          html = html + '<img src="' + this.user.avatar + '" class="avatar">';
          html = html + '<div class="from">' + this.user.name;
          html = html + '<span class="date">' + moment(this.createdAt).calendar() + '</span></div>';
          let vid = this.message.split('<p><a href="').join('').split('">h');
          vid = vid[0].split('watch?v=').join('embed/');
          console.log(vid);
          html = html + '<div class="text">' + this.message;
          html = html + '<iframe width="420" height="315" src="' + vid + '" frameborder="0" allowfullscreen></iframe>' + '</div>';
          html = html + '</div>';
        } else {
          html = html + '<div class="message" id="message-' + this.msg_id + '" style="opacity:0">';
          html = html + '<img src="' + this.user.avatar + '" class="avatar">';
          html = html + '<div class="from">' + this.user.name;
          html = html + '<span class="date">' + moment(this.createdAt).calendar() + '</span></div>';
          html = html + '<div class="text">' + this.message + '</div>';
          html = html + '</div>';
        }

          last = 'message-' + this.msg_id;

      });

      $('section.messages').append( html );

      $('.messages').animate({
          scrollTop: $('#' + last).offset().top
      }, 500);

      $('img').animate({opacity: 1}, 500 );
      $('.message').animate({opacity: 1}, 800 );


    },


    notifications : function ( ) {


      socket.on('room:notify', function( data ) {

        let currentRoom = localStorage.getItem('room_id');

        if ( currentRoom !== '' ) {
          console.log( data.room + ' has a new message.');
        }

      });


    },


    renderMessage : function ( data ) {

      let html,
          Room = this;

      if ( data.message.search('youtube.com') >= 0 || data.message.search('youtu.be') >= 0 ) {
        html = '<div class="message" id="message-' + data.msg_id + '" style="opacity:0">';
        html = html + '<img src="' + data.user.avatar + '" class="avatar">';
        html = html + '<div class="from">' + data.user.name;
        html = html + '<span class="date">' + moment(data.createdAt).calendar() + '</span></div>';
        let vid = data.message.split('<p><a href="').join('').split('">h');
        vid = vid[0].split('watch?v=').join('embed/');
        console.log(vid);
        html = html + '<div class="text">' + data.message;
        html = html + '<iframe width="420" height="315" src="' + vid + '" frameborder="0" allowfullscreen></iframe>' + '</div>';
        html = html + '</div>';
      } else {
        html = '<div class="message" id="message-' + data.msg_id + '" style="opacity:0">';
        html = html + '<img src="' + data.user.avatar + '" class="avatar">';
        html = html + '<div class="from">' + data.user.name;
        html = html + '<span class="date">' + moment(data.createdAt).calendar() + '</span></div>';
        html = html + '<div class="text">' + data.message + '</div>';
        html = html + '</div>';
      }


      $('section.messages').append( html );

      $('.messages').animate({
          scrollTop: $('#message-' + data.msg_id ).offset().top + 20000
      }, 500);


      $('img').animate({opacity: 1}, 500 );
      $('.message').animate({opacity: 1}, 800 );

    },

    // WHEN ROOM HAS BEEN JOINED
    welcome : function () {

      let Room = this;

      socket.on('room:welcome', function( data ) {

        console.log('Welcome!');
        console.log(data);

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

      let Room = this;


      $('.active-users ul').fadeOut()
      .html('');

      $.each(data, function() {

        let current_room = localStorage.getItem('currentRoom'),
            status = ' class="online"',
            user = this;

        if ( user.logged_in === false ) status = ' class="offline"';

        // $('.active-users ul li').each(function() {
          if ( user.room_id === localStorage.getItem('currentRoom')) {

            if (!user.name) user.name = user.user_id;

            let el = $('.active-users ul').append('<li' + status + ' data-user_id="' + user.user_id + '" data-room_id="' + user.room_id + '">' + user.name + '</li>').fadeIn();

          }
        // });

      });




    },

    updateUserRoomList : function ( data ) {

      let Room = this;


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

      let Room = this;

      socket.on( room + ':broadcast', function( data ) {
        Room.renderMessage(data);
      });

    },

    receiveAllMessage : function ( room ) {

      let Room = this;



    },

    fetchMessages : function ( user_id, room_id ) {

      let Room = this;


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
