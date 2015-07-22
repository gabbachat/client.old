'use strict';
module.exports = function() {
  var $;
  $ = require('jquery-browserify');
  return {
    init: function() {
      var Socket, User;
      Socket = window.socket;
      User = this;
      User.connected();
      User.check();
    },
    connected: function() {
      var Socket, User;
      Socket = window.socket;
      User = this;
      Socket.on('user:connected', function(data) {
        console.log('user:connected');
      });
    },
    list: function() {},
    listByRoom: function() {},
    login: function(email, user) {},
    check: function() {
      var Socket, User;
      Socket = window.socket;
      User = this;
      Socket.on('user:check:result', function(data) {
        console.log('user check: ' + data.status);
        $('#register-username').removeClass('taken').removeClass('ok').addClass(data.status);
        if (data.status === 'ok') {
          $('#register-username-status').html('sweet, that\'s available!').addClass('ok').removeClass('bad').animate({
            opacity: 1
          });
        }
        if (data.status === 'taken') {
          $('#register-username-status').html('sorry that one\'s taken :(').addClass('bad').removeClass('ok').animate({
            opacity: 1
          });
        }
      });
    }
  };
};
