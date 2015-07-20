module.exports = function () {

  const $         = require('jquery-browserify'),
        Backbone  = require('backbone'),
        Model     = require('../../../shared/models/user'),
        React     = require('react'),
        Register  = React.createFactory(require('../../../shared/components/register.jsx')),
        Chat      = React.createFactory(require('../../../shared/components/chat.jsx')),
        User      = require('../_modules/user')(),
        mountNode = document.getElementById('app');

  // SET DEFAULT DATA
  let Data = new Model({
      _id : null,
      auth: {
        provider : $('#register-provider').val(),
        token : $('#register-tkn').val(),
        secret : $('#register-scrt').val()
      },
      github : $('#github-id').val(),
      twitter : $('#twitter-id').val(),
      social : {
        github: {
          id: $('#github-id').val(),
          handle: $('#github-handle').val(),
          info: $('#github-info').val(),
          avatar: $('#github-avatar').val(),
          url: $('#github-url').val(),
          name: $('#github-name').val(),
          location: $('#github-location').val()
        },
        twitter: {
          id: $('#twitter-id').val(),
          handle: $('#twitter-handle').val(),
          info: $('#twitter-info').val(),
          avatar: $('#twitter-avatar').val(),
          url: $('#twitter-url').val(),
          name: $('#twitter-name').val(),
          location: $('#twitter-location').val()
        }
      },
      profile: {
        avatar: {
          provider: $('#register-provider').val(),
          src: $('#register-avatar').attr('src'),
        },
        email: null,
        info: null,
        location: $('#register-location').val(),
        name: $('#register-name').val(),
        username: $('#register-username').val()
      },
      session : {
        id : null,
        logged_in : false,
        room : null,
        status : null
      },
      rooms : []
  });


  return {

    defaults : {},

    init : function() {

    },

    check : function() {

      let Socket  = window.socket,
          Register = this;

      User.init();

      Socket.emit('user:login', Data.attributes);

      Socket.on('user:login', function( data ) {
        console.log('login status');
        console.log(data);

        if ( data.status === 'new') {
          console.log('new user, register');
          Register.render();
        } else {
          console.log('existing user, login');
          Register.chat();
        }

      });

      window.socket.on('user:register', function( data ) {

        console.log('registration status:');
        console.log(data);

        if ( data.status === 'ok' ) {
          Register.chat();
        }

      });

    },

    render : function() {

      console.log('Register.render()');

      React.render(new Register(Data.attributes), mountNode);
      $('.register').animate({opacity: 1});

    },

    chat : function() {

      console.log('Register.chat()');

      React.render(new Chat({}), mountNode);
      // $('.chat').animate({opacity: 1});

    }

  };

};
