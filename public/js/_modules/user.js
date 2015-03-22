'use strict';

module.exports = function () {

  const $         = require('jquery-browserify'),
      Browser = require('../_modules/browser'),
      Room    = require('../_modules/room')(),
      Socket  = window.socket;

  return {

    init : function() {

      let User = this;

      User.bind();
      User.connected();
      User.list();
      User.listByRoom();

      if ( localStorage.getItem('user_id') && localStorage.getItem('email') ) {
        console.log('already logged in.');
        let email = localStorage.getItem('email'),
            user_id = localStorage.getItem('user_id');
        User.login( email, user_id );
      } else {
        console.log('not logged in');
        if ( Browser.segment(1) === 'group' ) {
          location.href='/';
          console.log('relocate to /');
        }
      }

    },

    bind : function() {

      let User = this;

      // LOGIN WHEN USER PRESSER GO BUTTON
      $('button.go').click(function() {
        User.login( $('#email').val(), $('#username').val() );
      });

      // LOGIN WHEN USER PRESSE ENTER KEY
      $('#email').on('keyup', function(e) {
        if ( e.keyCode === 13 ) User.login( $('#email').val(), $('#username').val() );
      });

      $('.logout').click(function() {
        localStorage.clear();
        location.href='/';
      });

    },


    // WHEN THE USER HAS CONNECTED
    connected : function () {

      Socket.on('user:connected', function( data ) {

        localStorage.setItem('user_id', data.user_id);
        data.room_id = 'main';

        if ( Browser.segment(2) ) data.room_id = Browser.segment(2);

        Room.join(data);

      });

    },

    // GET LIST OF ALL USERS
    list : function () {
      Socket.on('user:list', function( data ) {
        Room.updateUserList(data);
      });
    },

    // GET LIST OF ALL USERS IN CURRENT ROOM
    listByRoom : function () {
      Socket.on('user:listRoom', function( data ) {
        Room.updateUserRoomList(data);
      });
    },

    // REGISTER USER WITH SERVER
    login : function ( email, user ) {

      console.log('logging in as ' + user );

      let room_id = 'main';

      if ( Browser.segment(1) === 'group' ) {
        room_id = Browser.segment(2);
        localStorage.setItem('user_id', user);
        localStorage.setItem('email', email);
        localStorage.setItem('room_id', room_id);
        Socket.emit('user:login', { email : email, user_id : user, room_id : room_id });
      } else {

        if ( localStorage.getItem('currentRoom') ) room_id = localStorage.getItem('currentRoom');

        localStorage.setItem('user_id', user);
        localStorage.setItem('email', email);
        localStorage.setItem('room_id', room_id);
        console.log('relocate to /group/' + room_id);
        location.href='/group/' + room_id;
      }


    }

  };

};
