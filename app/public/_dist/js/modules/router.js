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
    '': 'index',
    'chat': 'chat',
    'login': 'login',
    'search/:query': 'search',
    'search/:query/p:page': 'search',
    '*error': 'error'
  },
  initialize: function() {
    this.history.start({
      pushState: true
    });
    return console.log('Ampersand router loaded');
  },
  index: function() {
    Page.set(new View({
      template: Template.index
    }));
    return console.log('index route loaded');
  },
  chat: function() {
    return Page.set(new View({
      template: Template['register-form']({
        name: 'test'
      }),
      render: function() {
        return this.renderWithTemplate();
      }
    }));
  },
  error: function() {
    return Page.set(new View({
      template: '<h1>Page not found</h1>'
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
