Backbone = require('backbone')
Register = require('./_inc/register')()

Router = Backbone.Router.extend
  # CHAT ROUTER
  routes: 'chat': ->
    Register.check()
    return

module.exports = init: ->
  new Router
  Backbone.history.start pushState: true
  return
