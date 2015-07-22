(function() {
  var Model, React, ReactApp;

  Model = require('../../../../models/user');

  React = require('react');

  ReactApp = React.createClass({
    displayName: "ReactApp",
    componentWillReceiveProps: console.log('component updated'),
    componentDidMount: function() {
      console.info('loaded: shared/components/register.cjsx');
      return window.socket.emit('user:check', {
        username: this.props.profile.username
      });
    },
    checkUsername: function() {
      return window.socket.emit('user:check', {
        username: event.target.value
      });
    },
    registerUser: function() {
      var data;
      console.log('attempt to register user');
      data = {
        auth: {
          provider: this.props.provider,
          secret: this.props.auth.secret,
          token: this.props.auth.token
        },
        github: this.props.social.github.id,
        twitter: this.props.social.twitter.id,
        profile: {
          avatar: {
            provider: this.props.provider,
            src: this.props.profile.avatar
          },
          email: this.props.profile.email,
          info: this.props.info,
          location: this.props.profile.location,
          password: this.props.profile.password,
          name: this.props.profile.name,
          username: this.props.profile.username
        },
        social: {
          github: {
            avatar: this.props.social.github.avatar,
            handle: this.props.social.github.handle,
            id: this.props.social.github.id,
            info: this.props.social.github.info,
            location: this.props.social.github.location,
            name: this.props.social.github.name,
            url: this.props.social.github.url
          },
          twitter: {
            avatar: this.props.social.twitter.avatar,
            handle: this.props.social.twitter.handle,
            id: this.props.social.twitter.id,
            info: this.props.social.twitter.info,
            location: this.props.social.twitter.location,
            name: this.props.social.twitter.name,
            url: this.props.social.twitter.url
          }
        }
      };
      window.socket.emit('user:register', data);
    },
    render: function() {
      return React.createElement("section", {
        "className": "register"
      }, React.createElement("img", {
        "id": "register-avatar",
        "src": this.props.profile.avatar.src,
        "className": "avatar"
      }), React.createElement("h1", null, "Hi ", this.props.profile.name), React.createElement("h3", null, "We\'ve pulled in your information from ", this.props.auth.provider, ", just select a username and you\'re good to go!"), React.createElement("section", {
        "className": "required"
      }, React.createElement("label", null, "username"), React.createElement("span", {
        "id": "register-username-status",
        "className": "form-status ok"
      }), React.createElement("input", {
        "id": "register-username",
        "name": "register-username",
        "defaultValue": this.props.profile.username,
        "onChange": this.checkUsername
      })), React.createElement("section", {
        "className": "optional"
      }, React.createElement("h2", null, "Edit Your Info"), React.createElement("input", {
        "id": "register-name",
        "name": "register-name",
        "placeholder": "Name",
        "defaultValue": this.props.profile.name
      }), React.createElement("input", {
        "id": "register-email",
        "name": "register-email",
        "placeholder": "email@domain.com"
      }), React.createElement("label", null, "Create a password (optional)"), React.createElement("input", {
        "type": "password",
        "id": "register-password",
        "name": "register-password",
        "placeholder": "Password"
      })), React.createElement("input", {
        "type": "hidden",
        "id": "register-provider",
        "name": "register-provider",
        "value": this.props.auth.provider,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "register-tkn",
        "name": "register-tkn",
        "value": this.props.auth.token,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "register-scrt",
        "name": "register-scrt",
        "value": this.props.auth.secret,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "register-location",
        "name": "register-location",
        "value": this.props.profile.location,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-id",
        "name": "twitter-id",
        "value": this.props.social.twitter.id,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-handle",
        "name": "twitter-handle",
        "value": this.props.social.twitter.handle,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-info",
        "name": "twitter-info",
        "value": this.props.social.twitter.info,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-avatar",
        "name": "twitter-avatar",
        "value": this.props.social.twitter.avatar,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-url",
        "name": "twitter-url",
        "value": this.props.social.twitter.url,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-name",
        "name": "twitter-name",
        "value": this.props.social.twitter.name,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "twitter-location",
        "name": "twitter-location",
        "value": this.props.social.twitter.location,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-id",
        "name": "github-id",
        "value": this.props.social.github.id,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-handle",
        "name": "github-handle",
        "value": this.props.social.github.handle,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-info",
        "name": "github-info",
        "value": this.props.social.github.info,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-avatar",
        "name": "github-avatar",
        "value": this.props.social.github.avatar,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-url",
        "name": "github-url",
        "value": this.props.social.github.url,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-name",
        "name": "github-name",
        "value": this.props.social.github.name,
        "readOnly": true
      }), React.createElement("input", {
        "type": "hidden",
        "id": "github-location",
        "name": "github-location",
        "value": this.props.social.github.location,
        "readOnly": true
      }), React.createElement("button", {
        "id": "register-submit",
        "className": "button primary",
        "onClick": this.registerUser
      }, "Go"));
    }
  });

  module.exports = ReactApp;

}).call(this);
