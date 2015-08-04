var AmpersandRouter, AmpersandState, AmpersandView, AmpersandViewSwitcher, Page, Template, User, UserModel, View;

AmpersandRouter = require('ampersand-router');

AmpersandState = require('ampersand-state');

AmpersandView = require('ampersand-view');

AmpersandViewSwitcher = require('ampersand-view-switcher');

Page = new AmpersandViewSwitcher(document.querySelector('#gabba'));

Template = require('../templates');

UserModel = require('../../models/user');

User = new UserModel();

View = AmpersandView.extend();

module.exports = AmpersandRouter.extend({
  routes: {
    'chat': 'chat',
    'login': 'login',
    'search/:query': 'search',
    'search/:query/p:page': 'search'
  },
  initialize: function() {
    return this.history.start({
      pushState: true
    });
  },
  index: function() {
    return Page.set(new View({
      template: Template.index
    }));
  },
  chat: function() {
    Page.set(new View({
      template: Template['register-form'],
      bindings: {
        User: {
          profile: {
            name: 'World'
          }
        }
      },
      render: function() {
        return this.renderWithTemplate();
      }
    }));
    console.log('chat');
    console.log('gabba');
    console.log(window.gabba);
    return User.set('profile', {
      name: 'World'
    });
  },
  error: function() {
    return Page.set(new View({
      template: '<h1>Error, page not found</h1>'
    }));
  },
  login: function() {
    Page.set(new View({
      template: Template.login
    }));
    return console.log('login route loaded');
  },
  register: function() {
    Page.set(new View({
      template: Template.register
    }));
    return console.log('register route loaded');
  },
  search: function(query, page) {
    return console.log('search route loaded');
  }
});
