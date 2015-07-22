var $       = require('gulp-load-plugins')(),
    config  = require('../_config/gulp'),
    fs = require('fs'),
    gulp    = require('gulp'),
    inform  = require('./inform'),
    log = require('gulp-util').log,
    source = require('vinyl-source-stream'),
    transform = require('vinyl-transform');



gulp.task('coffee', function() {

  inform('Running gulp task "coffee"');

  gulp.src(config.build.coffee.src)
      .pipe($.coffee({bare: true}))
      .pipe(gulp.dest(config.build.coffee.dest));

  gulp.src(config.build.coffeeInc.src)
      .pipe($.coffee({bare: true}))
      .pipe(gulp.dest(config.build.coffeeInc.dest));

});


gulp.task('jsx', function () {

  inform('Running gulp task "jsx"');

  gulp.src(config.build.jsx.src)
      .pipe($.cjsx({bare: false}))
      .pipe(gulp.dest(config.build.jsx.dest));

});

gulp.task('js', function () {

  inform('Running gulp task "js"');

  gulp.src(config.build.js.src)
      .pipe($.babel())
      .pipe($.browserify({
        transform: [
          'babelify',
          ['reactify', {'es6': true}],
          // 'uglifyify'
        ],
        debug : false
      }))
      // .pipe()
      // .pipe($.uglify())
      .pipe(gulp.dest(config.build.js.dest));

}); // END: CSS TASK
