# MODULES
config = require('../config')
gulp = require('gulp')
inform = require('../lib/inform')

# TASK
gulp.task 'nodemon', (cb) ->

  inform 'Running gulp task "nodemon"'

  called = false

  require('gulp-nodemon')(
    script: config.server.file
    ext: 'css, html, jade, js, jsx, coffee'
    ignore: [
      'README.md'
      'node_modules'
      'bower_components'
      '.DS_Store'
    ]
    'execMap': 'js': config.server.type).on('start', ->
    if !called
      called = true
      cb()
    return
  ).on 'restart', ->
    inform 'restarting server...'
    return
