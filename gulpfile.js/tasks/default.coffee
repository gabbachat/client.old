# MODULES
config = require('../config')
gulp = require('gulp')

# TASK
gulp.task 'default', [
  'jade'
  'css'
  'img'
  'coffee'
  'js'
  'browser-sync'
], ->
  gulp.watch config.build.css.stylus, [ 'css' ]
  gulp.watch config.watch.js, [ 'js' ]
  gulp.watch config.watch.jade, [ 'jade' ]
  gulp.watch config.watch.coffee, [ 'coffee' ]
  gulp.watch config.watch.coffeeModels, [
    'coffee'
    'js'
  ]
  gulp.watch config.watch.coffeeModules, [
    'coffee'
    'js'
  ]
  gulp.watch config.watch.img, [ 'img' ]

  return
