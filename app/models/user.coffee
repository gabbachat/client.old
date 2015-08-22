'use strict'

module.exports = (app) ->
  console.log 'MODEL:user loaded'
  moment = require('moment')
  Waterline = require('waterline')

  # CREATE A NEW COLLECTION
  Waterline.Collection.extend
    identity: 'user'
    connection: 'compose'

    attributes:
      _id: 'string'
      auth: 'object'
      social: 'object'
      profile: 'object'
      session: 'object'
      rooms: 'array'
