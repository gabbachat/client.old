var Backbone, Register, Router;

Backbone = require('backbone');

Register = require('./_inc/register')();

Router = Backbone.Router.extend({
  routes: {
    'chat': function() {
      Register.check();
    }
  }
});

module.exports = {
  init: function() {
    new Router;
    Backbone.history.start({
      pushState: true
    });
  }
};
