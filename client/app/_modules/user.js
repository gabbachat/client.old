'use strict';

module.exports = function () {

  const $         = require('jquery-browserify'),
        Browser = require('../_modules/browser'),
        Room    = require('../_modules/room')();

  return {

    init : function() {

      let Socket  = window.socket,
          User = this;

      User.connected();
      User.check();
    },

    // WHEN THE USER HAS CONNECTED
    connected : function () {

      let Socket  = window.socket,
          User = this;

      Socket.on('user:connected', function( data ) {
        console.log('user:connected');
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

    },

    // CHECK IF USERNAME EXISTS
    check : function () {

      let Socket  = window.socket,
          User = this;

      Socket.on('user:check:result', function(data) {

        console.log( 'user check: ' + data.status );

        $('#register-username')
          .removeClass('taken')
          .removeClass('ok')
          .addClass(data.status);

        if ( data.status === 'ok' ) {
          $('#register-username-status')
            .html('that\'s available!')
            .addClass('ok')
            .removeClass('bad')
            .animate({opacity: 1});
        }

        if ( data.status === 'taken' ) {
          $('#register-username-status')
            .html('that name\'s taken :(')
            .addClass('bad')
            .removeClass('ok')
            .animate({opacity: 1});
        }


      });

    }

  };

};
