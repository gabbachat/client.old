# MODULES
config = require('../config')
gulp = require('gulp')
inform = require('../lib/inform')

# TASK
gulp.task 'browser-sync', [ 'nodemon' ], ->

  inform 'Running gulp task "browser-sync"'

  require('browser-sync').init null,
    proxy: 'http://localhost:' + config.app.config.port
    files: [ 'client/**/*.*' ]
    open: false
    port: config.app.config.browserSync.port
    notify: true

  return
