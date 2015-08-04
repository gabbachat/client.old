var Model;

Model = require('ampersand-model');

module.exports = Model.extend({
  cache: false,
  set: function(key, value) {
    console.log('user model set');
    console.log(key + ':');
    console.log(value);
    return console.log('end update');
  },
  update: function() {
    console.log('user model update');
  },
  props: {
    _id: 'string',
    auth: {
      provider: 'string',
      token: 'string',
      secret: 'string'
    },
    social: {
      github: {
        id: 'string',
        handle: 'string',
        info: 'string',
        avatar: 'string',
        url: 'string',
        name: 'string',
        location: 'string'
      },
      twitter: {
        id: 'string',
        handle: 'string',
        info: 'string',
        avatar: 'string',
        url: 'string',
        name: 'string',
        location: 'string'
      }
    },
    profile: {
      avatar: {
        provider: 'string',
        src: 'string'
      },
      email: 'string',
      info: 'string',
      location: 'string',
      name: 'string',
      password: 'string',
      username: 'string'
    },
    session: {
      id: 'string',
      logged_in: 'boolean',
      room: 'string',
      status: 'string'
    },
    rooms: 'array'
  }
});
