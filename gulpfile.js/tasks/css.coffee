# MODULES
config = require('../config')
gulp = require('gulp')
inform = require('../lib/inform')

# TASK
gulp.task 'css', ->

  inform 'Running gulp task "css"'

  gulp.src(config.build.css.src).pipe(require('gulp-stylus')()).pipe gulp.dest(config.build.css.dest)

  return
