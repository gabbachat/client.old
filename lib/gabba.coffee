module.exports = (app) ->
  {
    inform: (app, type, msg) ->
      if typeof msg == 'undefined'
        msg = false
      if type == 'start'
        @log ' '
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.blue
        @log '      FIRING UP THE gabba SERVER, STAND BY FOR LAUNCH. '.white
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.blue
        @log ' '
      else if type == 'done'
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.rainbow
        @log '              ALL SET. EVERYTHING IS AWESOME! '.white
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.rainbow
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.grey
        @log 'Point your browser to: '.white + app.address.magenta
        # this.log(' ');
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.grey
      else if type == 'eaddr'
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red
        @log ' '
        @log '     OH NOES! gabba Server Failed to start! :( '.yellow
        @log ' '
        @log 'It looks like something is already running on port ' + app.config.port
        @log 'Please double check that gabba is not already running'
        @log 'If you continue to see this error, you should update the'
        @log 'port number in your config file (config/_settings.js)'
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red
        @log ' '
      else if type == 'error'
        @log ' '
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red
        @log 'ERROR:'
        @log msg.white
        @log '# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red
      return
    log: (what) ->
      if app.config.logging.console == true
        console.log what
      return
    emptyObject: (obj) ->
      !Object.keys(obj).length
    countObject: (obj) ->
      count = 0
      for key of obj
        if obj(key)
          count++
      count
    throw: (num) ->
      code =
        400: '400 Bad Request'
        401: '401 Unauthorized'
        403: '403 Forbidden'
        404: '404 Not Found'
        405: '405 Method Not Allowed'
        500: '500 Internal Server Error'
      err = new Error(code[num])
      err.code = num
      err.message = code[num]
      err.status = num
      err
    throwError: (err) ->
      err.gabba.status = err.code
      if typeof err.stack != 'undefined'
        app.log 'ERROR: '.red + err.stack
      else
        app.log 'ERROR: '.red + err.message
      if app.config.errorReporting.browser == true
        err.gabba.errorTitle = err.title
        err.gabba.errorMessage = err.message
      else
        err.gabba.errorTitle = 'Internal Server Error'
        err.gabba.errorMessage = 'The server has encountered an unexpected error and cannot continue'
      controller = require(app.base + '/app/controllers/errorController.js')
      if err.code == 404
        # return yield controller.throw404(err.gabba).next();
      else if err.code == 500
        # return yield controller.throw500(err.gabba).next();
      else
        # return yield controller.throwGeneric(err.gabba).next();
      return

  }
