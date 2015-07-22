(function() {
  var React, ReactApp;

  React = require('react');

  ReactApp = React.createClass({
    displayName: 'ReactApp',
    componentDidMount: function() {
      return console.info('loaded: shared/components/chat.jsx');
    },
    render: function() {
      return React.createElement("section", {
        "className": "chat"
      }, React.createElement("h3", null, "Logged in"));
    }
  });

  module.exports = ReactApp;

}).call(this);
