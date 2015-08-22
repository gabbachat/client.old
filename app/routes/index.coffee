module.exports = (app) ->

  console.log 'router loaded'

  # ARE WE USING SOCKETS HERE? THIS CAN LIKELY BE REMOVED
  require('socket.io-client')(app.public.socket).on 'connected', (data) ->
    console.log 'socket connected: '
    console.log data.connected
    return

  # HANDLE /CHAT ROUTE
  app.router.get '/chat', ->

    console.log 'CHAT ROUTE'

    avatar = {}
    github = active: false
    profile = {}
    twitter = active: false

    # HANDLE GITHUB
    if @session.passport.provider == 'github'
      profile =
        avatar:
          provider: 'github'
          src: @session.passport._json.avatar_url
        email: null
        info: null
        location: @session.passport._json.location
        name: @session.passport._json.name
      github =
        active: true
        id: @session.passport._json.id
        handle: @session.passport._json.login
        info: null
        avatar: @session.passport._json.avatar_url
        url: @session.passport._json.url
        name: @session.passport._json.name
        location: @session.passport._json.location
        data: @session.passport._json

    # HANDLE TWITTER
    if @session.passport.provider == 'twitter'
      profile =
        avatar: src: @session.passport._json.profile_image_url
        email: null
        info: @session.passport._json.description
        location: @session.passport._json.location
        name: @session.passport._json.name
      twitter =
        active: true
        id: @session.passport._json.id
        handle: @session.passport._json.screen_name
        info: @session.passport._json.description
        avatar: @session.passport._json.profile_image_url
        url: @session.passport._json.url
        name: @session.passport._json.name
        location: @session.passport._json.location
        data: @session.passport._json

    # SET USER DATA
    userData =
      auth:
        provider: @session.passport.provider
        token: @session.token
      profile:
        avatar: profile.avatar
        email: profile.email
        info: profile.info
        joined: moment = require('moment')()
        location: profile.location
        name: profile.name
        password: null
        registration:
          complete: false
          token: @session.token
      session:
        id: null
        logged_in: false
        room: null
        status: 'offline'
      social:
        github: github
        twitter: twitter

    # LOAD CONTROLLER
    controller = require('../controllers/userController')(app)

    # PROCESS REGISTRATION
    result = yield controller.register(userData)

    # NEW USER
    if result.status == 'success'
      @body = 'user is new and should complete registration.'

    # EXISTING USER
    else if result.status == 'exists'

      # USER HAS COMPLETED REGISTRATION
      if result.data[0].profile.registration.complete == true
        @body = 'existing user, continue to login.'

      # USER NEEDS TO COMPLETE REGISTRATION
      else
        @body = 'user exists but has not completed registration.'

    # ERROR
    else
      @response = 500
      @body =
        status: result.status
        data: result.data

    return


  # LOAD INDEX PAGE & LET AMPERSAND HANDLE ALL OTHER ROUTING
  app.router.get '*', (next) ->
    console.log 'load default route'
    @render 'index',
      title: app.name
      site: app
    yield next
