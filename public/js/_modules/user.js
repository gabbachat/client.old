'use strict';

module.exports = function () {

  var $       = require('jquery-browserify'),
        Browser    = require('../_modules/browser'),
        Room    = require('../_modules/room')(),
        Socket  = window.socket;

  return {

    init : function() {

      var User = this;

      User.bind();
      User.connected();

      // Browser = require('../_modules/browser')();

      if ( localStorage.getItem('_id') ) {

        var handle = localStorage.getItem('_id');

        User.login( handle );
      } else {
        if ( Browser.segment(1) === 'group' ) location.href='/';
      }

    },

    bind : function() {

      var User = this;

      // LOGIN WHEN USER PRESSER GO BUTTON
      $('button.go').click(function() {
        User.login( $('#username').val() );
      });

      // LOGIN WHEN USER PRESSE ENTER KEY
      $('#username').on('keyup', function(e) {
        if ( e.keyCode === 13 ) User.login( $('#username').val() );
      });

      $('.logout').click(function() {
        localStorage.clear();
        location.href='/';
      });

    },


    // WHEN THE USER HAS CONNECTED
    connected : function () {

      Socket.on('user:connected', function( user ) {
        console.log('you are now connected as ' + user.handle);

        localStorage.setItem('_id', user.handle);

        console.log('segment:');
        console.log(Browser.segment(2));

        if ( Browser.segment(2) ) {
          console.log('join ' + Browser.segment(2));
          Room.join(user.handle, Browser.segment(2) );
        } else {
          console.log('join main');
          Room.join(user.handle, 'main');
          console.log('logged in. forward to room.');
          Browser.forward('group/main');
        }

      });

    },

    // REGISTER USER WITH SERVER
    login : function ( user ) {

      console.log('logging in as ' + user );

      Socket.emit('user:login', { handle : user });

    }

  };

};
