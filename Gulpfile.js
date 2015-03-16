var app = {};

require('./config/_settings')(app);
require('./config/environment/development')(app);

var browserSync = require('browser-sync'),
    colors      = require('colors'),
    gulp        = require('gulp'),
    path        = require('path'),
    dir         = {
      app       : 'server.js',
      // build : app.config.buildDir,
      css       : app.dir.public + 'css/**/*.css',
      img       : app.dir.public + 'img/**/*',
      js        : [app.dir.public + 'js/**/*', 'app/**/*.js'],
      public    : app.dir.public,
      stylus    : app.dir.public + 'css/**/*.styl',
      lib       : app.dir.public + 'lib/**/*'
    },
    $           = require('gulp-load-plugins')(),
    reload      = browserSync.reload;


function inform(msg) {
  console.log(' ');
  console.log(' ');
  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~'.blue);
  console.log('INFO: '.blue + msg);
  console.log('~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~'.blue);
  console.log(' ');
}

gulp.task('start', ['default']);

// DEFAULT TASK, HANDLES ALL BASIC SERVER STUFF
gulp.task('default', ['css', 'js', 'browserSync'], function () {
  gulp.watch(dir.less, ['css'] );
  gulp.watch(dir.js, ['js', reload]);
  gulp.watch(dir.img);
});

// BROWSER SYNC - http://www.browsersync.io/docs/gulp/
gulp.task('browserSync', ['nodemon'], function() {

  inform('Running gulp task "browserStack"');

  browserSync.init(null, {
    proxy: 'http://localhost:' + app.config.port,
    files: ['public/**/*.*'],
    open: false,
    port: app.config.browserSync.port,
    notify: false
  });

});


// STYLESHEETS
gulp.task('css', function () {

  inform('Running gulp task "CSS"');

  return gulp.src([
    dir.public + 'css/*.' + app.config.engines.css.extension,
    dir.css
  ])
  .pipe($.autoprefixer({browsers: [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    'ios >= 7',
    'android >= 4.4',
    'bb >= 10'
  ]}))
  // Concatenate and minify styles
  .pipe($.if('*.css', $.csso()))
  .pipe(gulp.dest(app.dir.public + '_dist/css'))
  .pipe($.size({title: 'css'}));

  // CSS MINIFICATION WILL GO HERE. POSSIBLY SASS & LESS UNTIL THEY WORK IN IO

}); // END: CSS TASK




// IMAGES
gulp.task('img', function () {
  return gulp.src(app.dir.public + 'img/**/*')
    .pipe($.cache($.imagemin({
      progressive: true,
      interlaced: true
    })))
    .pipe(gulp.dest('dist/images'))
    .pipe($.size({title: 'images'}));

}); // END: IMG TASK


// JAVASCRIPTS
gulp.task('js', function() {

  inform('Running gulp task "JS"');

  return gulp.src(dir.js)
    .pipe($.size({title: 'javascript'}));

}); // END: JS TASK


// NODEMON
gulp.task('nodemon', function (cb) {

  inform('Running gulp task "nodemon"');

  var called = false;
  return $.nodemon({
    script: 'server.js',
    ext: 'js, jade, hbs, nj, styl, sass, less, css',
    ignore: ['README.md', '.DS_Store'],
    'execMap': {
      'js': 'iojs'
    }
  }).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    setTimeout(function () {
      reload({ stream: false });
    }, 1000);
  });
});
