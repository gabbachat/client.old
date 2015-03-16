'use strict';

const $     = require('jquery-browserify'),
      socket = window.socket = io.connect(),
      User = window.User = require('./_modules/user')(),
      Room = window.Room = require('./_modules/room')(),
      Yak = window.Yak = require('./_modules/yak')();

// DOM READY
$(document).on('ready', function() {

  User.init();
  Room.init();

});
