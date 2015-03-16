'use strict';

module.exports = function(app) {


  // >  - - - - - - - - <
  // >  CSS PROCESSORS  <
  // >  - - - - - - - - <

  // SASS
  // Not working with iojs yet. Waiting on node-sass to get io.js compatibility :/
  if ( app.config.engines.css.template === 'sass' ) {
    app.log('INFO: '.blue + 'using ' + 'sass'.yellow + ' for css');
    app.use(require('koa-sass')(app.dir.css));
  }

  // STYLUS
  else if ( app.config.engines.css.template === 'stylus' ) {
    app.log('INFO: '.blue + 'using ' + 'stylus'.yellow + ' for css');
    app.use(require('koa-stylus')(app.dir.css));
  }

  // LESS
  // not working with iojs yet :/
  else if ( app.config.engines.css.template === 'less' ) {
    app.log('INFO: '.blue + 'using ' + 'less'.yellow + ' for css');
    app.use(require('koa-less')(app.dir.css));
  }

  // >  - - - - - - - - <
  // >  OPEN DATABASE   <
  // >  - - - - - - - - <

  if ( app.config.db !== false ) require(app.base + '/config/db')(app);


  // >  - - - - - - - - <
  // >  HTML TEMPLATES  <
  // >  - - - - - - - - <

  // HANDLEBARS
  if ( app.config.engines.html.template === 'handlebars' ) {

    app.log('INFO: '.blue + 'rendering templates with ' + app.config.engines.html.template.yellow);

    let htmlEngine = require('koa-hbs');

    app.use(htmlEngine.middleware({
      viewPath: app.dir.views,
      partialsPath: app.dir.views + 'partials'
    }));

  // JADE
  } else if ( app.config.engines.html.template === 'jade' ) {

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

  // NUNJUCKS
  } else if ( app.config.engines.html.template === 'nunjucks' ) {

    app.log('INFO: '.blue + 'rendering templates with ' + app.config.engines.html.template.yellow);

    let htmlEngine = require('koajs-nunjucks');
    app.use( htmlEngine(app.dir.views, {}) );

  // FLAT HTML (DOESN'T WORK YET)
  } else {
    let htmlEngine = false;
  }


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
