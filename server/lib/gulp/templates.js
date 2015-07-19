var $       = require('gulp-load-plugins')(),
    config  = require('../../../config/gulp'),
    // jade    = require('gulp-react-jade'),
    // jade    = require('../../../server/lib/gulp-jade-react'),
    gulp    = require('gulp'),
    inform  = require('./inform'),
    wrap    = require('gulp-wrap-amd');

// Build React templates
// gulp.task('templates', function () {
//   gulp.src(config.templates.src)
//     .pipe(jade())
//     .pipe(gulp.dest(config.templates.dest))
// });
