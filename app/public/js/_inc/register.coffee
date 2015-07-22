module.exports = ->

  $ = require('jquery-browserify')
  Backbone = require('backbone')
  Model = require('../../../../models/user')
  React = require('react')
  Register = React.createFactory(require('../../../_dist/js/components/register.js'))
  Chat = React.createFactory(require('../../../_dist/js/components/chat.js'))
  User = require('./user')()
  mountNode = document.getElementById('app')

  {

    defaults: {}

    init: ->

    check: ->
      Socket = window.socket
      self = this
      User.init()
      Socket.emit 'user:login', self.getData()
      Socket.on 'user:login', (data) ->
        console.log 'login status'
        console.log data
        if data.status == 'new'
          console.log 'new user, register'
          self.render()
        else
          console.log 'existing user, login'
          self.chat()
        return
      window.socket.on 'user:register', (data) ->
        console.log 'registration status:'
        console.log data
        if data.status == 'ok'
          self.chat()
        return
      return

    render: ->
      self = this
      console.log 'Register.render()'
      React.render new Register(self.getData()), mountNode
      $('.register').animate opacity: 1
      return

    chat: ->
      self = this
      console.log 'Register.chat()'
      React.render new Chat({}), mountNode
      return

    getData: ->
      # SET DEFAULT DATA
      Data = new Model(
        _id: null
        auth:
          provider: $('#register-provider').val()
          token: $('#register-tkn').val()
          secret: $('#register-scrt').val()
        github: $('#github-id').val()
        twitter: $('#twitter-id').val()
        social:
          github:
            id: $('#github-id').val()
            handle: $('#github-handle').val()
            info: $('#github-info').val()
            avatar: $('#github-avatar').val()
            url: $('#github-url').val()
            name: $('#github-name').val()
            location: $('#github-location').val()
          twitter:
            id: $('#twitter-id').val()
            handle: $('#twitter-handle').val()
            info: $('#twitter-info').val()
            avatar: $('#twitter-avatar').val()
            url: $('#twitter-url').val()
            name: $('#twitter-name').val()
            location: $('#twitter-location').val()
        profile:
          avatar:
            provider: $('#register-provider').val()
            src: $('#register-avatar').attr('src')
          email: null
          info: null
          location: $('#register-location').val()
          name: $('#register-name').val()
          username: $('#register-username').val()
        session:
          id: null
          logged_in: false
          room: null
          status: null
        rooms: [])

      Data.attributes

  }
