const Backbone  = require('backbone');

let Router = Backbone.Router.extend({

    routes : {
      'chat' : function() {
        require('./components/register')().render();
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
