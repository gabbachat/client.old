const Backbone  = require('backbone');

let Register = require('./components/register')();

let Router = Backbone.Router.extend({

    routes : {
      'chat' : function() {
        Register.check();
      },
    }

});

module.exports = {

  init : function () {

    new Router();

    Backbone.history.start({
      pushState: true
    });

  }
};
