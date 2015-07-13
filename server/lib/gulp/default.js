var $       = require('gulp-load-plugins')(),
    config  = require('../../../config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform');

gulp.task('default', ['polymer-templates', 'css', 'img', 'js', 'browser-sync'], function () {

  gulp.watch(config.build.css.src, ['css'] );
  gulp.watch(config.watch.js, ['js'] );
  gulp.watch(config.watch.img, ['img'] );
  gulp.watch(config.polymerTemplates.src, ['polymer-templates', 'js'] );

});