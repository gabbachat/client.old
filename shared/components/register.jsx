const Model     = require('../models/user'),
      React     = require('react');

// SET DEFAULT DATA
var User = new Model({
    avatar: 'img/gabba.png',
    name: null,
    provider: null,
    username: null
});

console.log(User.attributes);

var ReactApp = React.createClass({

  getDefaultProps: function() {
    return User.attributes;
  },

  // CHECK THAT USERNAME IS AVAILABLE
  checkUsername: function( event ) {
    console.log( event.target.value );
  },

  render: function() {
    return (
      <section className="register">
        <img src={this.props.avatar} className="avatar" />
        <h1>Hi {this.props.name}</h1>
        <h3>We've pulled in your information from {this.props.provider}, just select a username and you're good to go!</h3>

        <section className="required">
          <label>username</label>
          <input
                id="username"
                value={this.props.username}
                onChange={this.checkUsername}
          />
        </section>

        <section className="optional">
          <h2>Edit Your Info</h2>
          <input id="name" placeholder="Name" value={this.props.name} />
          <input placeholder="email@domain.com"/>
          <label>Create a password (optional)</label>
          <input placeholder="Password"/>
        </section>

        <input type="hidden" id="provider" name="provider" value={this.props.provider} />

      </section>
    );

  }

});

/* Module.exports instead of normal dom mounting */
module.exports = ReactApp;
