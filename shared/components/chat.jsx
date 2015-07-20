const Model     = require('../models/user'),
      React     = require('react');

var ReactApp = React.createClass({

  // getDefaultProps: function() {
  //   return User.attributes;
  // },


  // ON LOAD
  componentDidMount: function() {

    console.info('loaded: shared/components/chat.jsx');

  },

  render: function() {
    return (
      <section className="chat">
        <h3>Logged in</h3>
      </section>
    );

  }

});

/* Module.exports instead of normal dom mounting */
module.exports = ReactApp;
