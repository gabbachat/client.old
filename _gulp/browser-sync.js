var $       = require('gulp-load-plugins')(),
    config  = require('../_config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform');

// BROWSER SYNC - http://www.browsersync.io/docs/gulp/
gulp.task('browser-sync', ['nodemon'], function() {

  inform('Running gulp task "browser-sync"');

  require('browser-sync').init( null, {
    proxy: 'http://localhost:' + config.app.config.port,
    files: ['client/**/*.*'],
    open: false,
    port: config.app.config.browserSync.port,
    notify: true
  });

});
