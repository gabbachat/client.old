var $       = require('gulp-load-plugins')(),
    config  = require('../../../_config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform');

gulp.task('css', function () {

  inform('Running gulp task "css"');

  gulp.src(config.build.css.src)
    .pipe($.stylus())
    .pipe(gulp.dest(config.build.css.dest));

}); // END: CSS TASK
