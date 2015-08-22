'use strict'

module.exports = (app) ->

  console.log 'attempting to establish connection to: ' + app.config.db.host

  mongo = require('sails-mongo')

  {

    adapters:
      'default': mongo
      'mongo': mongo

    connections: compose:
      adapter: app.config.db.adapter
      url: app.config.db.host + app.config.db.name

  }
