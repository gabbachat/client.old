'use strict';

module.exports = function(app) {

  const session = require('koa-generic-session'),
        redisStore = require('koa-redis'),
        bodyParser = require('koa-bodyparser'),
        Router = require('koa-router')(),
        passport = require('koa-passport');

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

  // SET OUR KEYS
  app.keys = [process.env.SECRET || app.config.secret];

  // USE REDIS FOR SESSION STORAGE
  app.use(session({
    store: redisStore()
  }));

  // MAKE SESSION DATA AVAILABLE TO APP
  app.use(function *( next ) {
    app.session = this.session;
    yield next;
  });

  // app.use(bodyParser());

  // ENABLE PASSPORT
  app.use(passport.initialize());
  app.use(passport.session());

  // ENABLE ROUTER
  app.router = Router;
  app.use(app.router.routes());


};
