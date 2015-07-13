var $       = require('gulp-load-plugins')(),
    config  = require('../../../config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform');

gulp.task('js', function () {

  inform('Running gulp task "js"');

  gulp.src(config.build.js.src)
      .pipe($.babel())
      .pipe($.browserify({
        transform: [require('../polymerize'), 'babelify'],
        insertGlobals : false,
        debug : true
      }))
      .pipe(gulp.dest(config.build.js.dest));

}); // END: CSS TASK
