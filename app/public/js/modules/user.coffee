'use strict'

module.exports = ->

  $ = require('jquery-browserify')

  {

    init: ->
      Socket = window.socket
      User = this
      User.connected()
      User.check()
      return

    connected: ->
      Socket = window.socket
      User = this
      Socket.on 'user:connected', (data) ->
        console.log 'user:connected'
        return
      return

    list: ->

    listByRoom: ->

    login: (email, user) ->

    check: ->
      Socket = window.socket
      User = this
      Socket.on 'user:check:result', (data) ->
        console.log 'user check: ' + data.status
        $('#register-username').removeClass('taken').removeClass('ok').addClass data.status
        if data.status == 'ok'
          $('#register-username-status').html('sweet, that\'s available!').addClass('ok').removeClass('bad').animate opacity: 1
        if data.status == 'taken'
          $('#register-username-status').html('sorry that one\'s taken :(').addClass('bad').removeClass('ok').animate opacity: 1
        return
      return

  }
