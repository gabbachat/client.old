window.Gabba = init: (server) ->

  Socket = window.socket = io.connect(server)

  Socket.on 'connected', (data) ->
    console.log 'socket connected with id ' + data.id
    return

  Socket.on 'error', (data) ->
    console.log 'socket error: '
    console.error data
    return

  require('./router').init() # INITIALIZE ROUTER

  return
