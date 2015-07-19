var React = require('react');


console.log('REGISTER TEMPLATE');
// console.log(this.session.passport);

var ReactApp = React.createClass({

  getDefaultProps: function() {
    return {
      name: 'World'
    };
  },

  render: function() {
    return <div>Hello {this.props.name}</div>;
  }

});

/* Module.exports instead of normal dom mounting */
module.exports = ReactApp;
