'use strict';

module.exports = function(app) {


  // >  - - - - - - - - <
  // >  CSS PROCESSOR   <
  // >  - - - - - - - - <

  app.log('INFO: '.blue + 'using ' + 'stylus'.yellow + ' for css');
  app.use(require('koa-stylus')(app.dir.css));


  // >  - - - - - - - - <
  // >  HTML TEMPLATES  <
  // >  - - - - - - - - <

  // JADE

  app.log('INFO: '.blue + 'rendering templates with ' + app.config.engines.html.template.yellow);

  let htmlEngine = require('koa-jade');

  app.use(htmlEngine.middleware({
    viewPath: app.dir.views,
    debug: app.config.debug,
    cache: app.config.cache,
    pretty: app.config.prettify.html,
    compileDebug: app.config.debug,
    basedir: app.base
  }));

  // >  - - - - - - - - <
  // >  MISCELLANEOUS   <
  // >  - - - - - - - - <

  // GZIP
  if ( app.config.gzip === true ) app.use( require('koa-gzip')() );

  // ENABLE POLYFILLS
  if ( app.config.polyfills === true ) app.use(require('koa-polyfills')());

  // ENABLE CORS
  if ( app.config.cors === true ) app.use(require('koa-cors')());

  // SERVE STATIC FILES
  app.use( require('koa-static')( app.dir.public ) );


};
