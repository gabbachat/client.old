# REQUIRES
AmpersandRouter       = require 'ampersand-router'
AmpersandState        = require 'ampersand-state'
AmpersandView         = require 'ampersand-view'
AmpersandViewSwitcher = require 'ampersand-view-switcher'
Page                  = new AmpersandViewSwitcher(document.querySelector('#gabba'))
Template              = require '../templates'
UserModel             = require '../../models/user'
User                  = new UserModel()
View                  = AmpersandView.extend()


# MODULE
module.exports = AmpersandRouter.extend(

  # ROUTE OBJECT
  routes:
    # '/': 'index',
    # 'auth/:type': 'auth',
    'chat': 'chat'
    'login': 'login'
    'search/:query': 'search'
    'search/:query/p:page': 'search'
    # '*error': 'error'

  # INTIALIZE ROUTER
  initialize: ->
    @history.start pushState: true

  # MAIN INDEX PAGE
  index: ->
    Page.set new View(template: Template.index)

  # HANDLE ERRORS
  chat: ->

    Page.set new View(
      template: Template['register-form'],
      bindings: {
        User: {
          profile: {
            name: 'World'
          }
        }
      },
      render: ->
        this.renderWithTemplate();
    )

    console.log 'chat'
    console.log 'gabba'
    console.log window.gabba

    User.set('profile', {
      name: 'World'
    });

  # HANDLE ERRORS
  error: ->
    Page.set new View(template: '<h1>Error, page not found</h1>')

  # LOGIN PAGE
  login: ->
    Page.set new View(template: Template.login)
    console.log 'login route loaded'

  # REGISTRATION PAGE
  register: ->
    Page.set new View(template: Template.register)
    console.log 'register route loaded'

  # TMP FUNCTION
  search: (query, page) ->
    console.log 'search route loaded'

)
