var $       = require('gulp-load-plugins')(),
    config  = require('../_config/gulp'),
    fs = require('fs'),
    gulp    = require('gulp'),
    inform  = require('./inform'),
    log = require('gulp-util').log;

gulp.task('jsx', function () {

  gulp.src(config.build.react.src)
      .pipe($.cjsx({bare: false}))
      .pipe(gulp.dest(config.build.react.dest));

});

gulp.task('js', function () {

  inform('Running gulp task "js"');

  gulp.src(config.build.js.src)
      .pipe($.babel())
      .pipe($.browserify({
        transform: [
          'babelify',
          ['reactify', {'es6': true}]
        ],
        debug : true
      }))
      .pipe(gulp.dest(config.build.js.dest));

}); // END: CSS TASK
