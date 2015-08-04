# MODULES
$ = require('gulp-load-plugins')()
config = require('../config')
gulp = require('gulp')
inform = require('../lib/inform')
source = require('vinyl-source-stream')
transform = require('vinyl-transform')

# TASK
gulp.task 'coffee', ->

  inform 'Running gulp task "coffee"'

  # TRANSFORM MAIN COFFEE FILES
  gulp.src(config.build.coffee.src).pipe($.coffee(bare: true)).pipe($.babel()).pipe($.browserify(
      transform: [ 'babelify' ]
      extensions: [ '.coffee' ]
      paths: [ '../_dist/js/' ]
      debug: false)).pipe gulp.dest(config.build.coffee.dest)

  # TRANSFORM COFFEE MODULES
  gulp.src(config.build.coffeeModules.src).pipe($.coffee(bare: true)).pipe gulp.dest(config.build.coffeeModules.dest)

  # TRANSFORM COFFEE MODELS
  gulp.src(config.build.coffeeModels.src).pipe($.coffee(bare: true)).pipe gulp.dest(config.build.coffeeModels.dest)

  return
