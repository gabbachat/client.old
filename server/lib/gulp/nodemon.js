var $       = require('gulp-load-plugins')(),
    config  = require('../../../_config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform');

// NODEMON
gulp.task('nodemon', function (cb) {

  inform('Running gulp task "nodemon"');

  var called = false;
  return $.nodemon({
    script: config.server.file,
    ext: 'css, html, jade, js, styl',
    ignore: ['README.md', 'node_modules', 'bower_components', '.DS_Store'],
    'execMap': {
      'js': config.server.type
    }
  }).on('start', function () {
    if (!called) {
      called = true;
      cb();
    }
  })
  .on('restart', function () {
    inform('restarting server...');
  });
});
