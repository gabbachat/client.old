# MODULES
gulp = require('gulp')
inform = require('../lib/inform')

# TASK
gulp.task 'jade', ->
  inform 'Running gulp task "jade"'
  require('templatizer') './app/views/partials/**/*.jade', './app/public/_dist/js/templates.js',
  namespace: 'app'
  return
