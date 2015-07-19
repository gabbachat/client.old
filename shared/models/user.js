const _         = require('underscore'),
      Backbone  = require('backbone');

module.exports = Backbone.Model.extend({
      defaults : {
        avatar: null,
        name: null,
        provider: null,
        username: null
      }
    });
