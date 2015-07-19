module.exports = function () {

  const $         = require('jquery-browserify'),
        Backbone  = require('backbone'),
        Model     = require('../../../shared/models/user'),
        React     = require('react'),
        Register  = React.createFactory(require('../../../shared/components/register.jsx')),
        mountNode = document.getElementById('app');

  let User = new Model({
      avatar: $('.avatar').attr('src'),
      name: $('#name').val(),
      provider: $('#provider').val(),
      username: $('#username').val()
  });


  return {

    defaults : {},

    init : function() {

      console.log('Register.init()');

    },

    render : function() {

      console.log('Register.render()');

      console.log(User.attributes);

      React.render(new Register(User.attributes), mountNode);
    }

  };

};
