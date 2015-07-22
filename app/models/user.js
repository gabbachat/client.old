const _         = require('underscore'),
      Backbone  = require('backbone');

module.exports = Backbone.Model.extend({
      defaults : {
        '_id' : null,
        'auth' : {
          'provider' : null,
          'token' : null,
          'secret' : null
        },
        'social' : {
          'github': {
            id: null,
            handle: null,
            info: null,
            avatar: null,
            url: null,
            name: null,
            location: null
          },
          'twitter': {
            id: null,
            handle: null,
            info: null,
            avatar: null,
            url: null,
            name: null,
            location: null
          }
        },
        'profile' : {
          'avatar' : {
            'provider' : null,
            'src' : null
          },
          'email' : null,
          'info' : null,
          'location' : null,
          'name' : null,
          'password' : null,
          'username' : null
        },
        'session' : {
          'id' : null,
          'logged_in' : false,
          'room' : null,
          'status' : null
        },
        'rooms' : []
      }
    });
