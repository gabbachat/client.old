var $       = require('gulp-load-plugins')(),
    config  = require('../../../config/gulp'),
    gulp    = require('gulp'),
    inform  = require('./inform'),
    wrap    = require('gulp-wrap-amd');


gulp.task('polymer-templates', ['polymer-html-templates'], function() {
  inform('Running gulp task "polymer-templates"');
});

// GENERATE HTML TEMPLATES
gulp.task('polymer-html-templates', function() {

  gulp.src( config.polymerTemplates.src )
    .pipe($.jade({
      locals: {}
    }))
    .pipe( gulp.dest( config.polymerTemplates.dest ) )

});

// GENERATE JS TEMPLATES
gulp.task('polymer-js-templates', function() {

  gulp.src( config.polymerTemplates.src )
    .pipe( $.jade({
      client: true
    }))
    .pipe( wrap({
      deps: ['jade'],
      params: ['jade']
    }))
    .pipe( gulp.dest( config.polymerTemplates.dest ) )

});
