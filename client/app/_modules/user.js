'use strict';

module.exports = function () {

  const $         = require('jquery-browserify'),
        Browser = require('../_modules/browser'),
        Room    = require('../_modules/room')();

  return {

    init : function() {

      let Socket  = window.socket,
          User = this;

      console.log('User.init()');
      // console.log( Socket );

      // User.bind();
      User.connected();
      User.find();
      // User.listByRoom();
    },

    bind : function() {

    },


    // WHEN THE USER HAS CONNECTED
    connected : function () {

      let Socket  = window.socket,
          User = this;

      Socket.on('user:connected', function( data ) {
        console.log('user:connected');

        // localStorage.setItem('user_id', data.user_id);
        // data.room_id = 'main';
        //
        // if ( Browser.segment(2) ) data.room_id = Browser.segment(2);
        //
        // Room.join(data);

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

    // SEARCH USER WITH SERVER
    find : function () {

      console.log('User.find()');

      let Socket  = window.socket,
          User = this;

      Socket.on('user:check:result', function(data) {
        console.log(data.status);
      });

    }

  };

};
