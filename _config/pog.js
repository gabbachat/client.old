// # Settings
// Pog is meant to both be useable out of the box and über-configurable. Most of the important bits can be customized in this file:


'use strict';

// ### PATH
// This defines our path and lets pog know where to find stuff. You shouldn't need to change either of these lines and will likely break something if you do.
var path = require('path'),
rootPath = path.normalize(__dirname + '/..');


module.exports = function (app) {

  // Meat & Potato's
  // This is where all the useful stuff lives that you are likely to want to set.

  // ### APP NAME
  // This isn't used in many places by default, but is available throughout the app should you ever need it.
  app.name = 'gabba';

  // ### DIRECTORIES
  // Pog uses these references to link to files throughout the application. If you want to change the location of anything, you are welcome to, just make sure you update it here:
  app.dir = {
    build : app.base + '/client/_dist/',
    controllers : app.base + '/server/controllers/',
    bower : app.base + '/client/_bower/',
    components : app.base + '/client/components/',
    css : app.base + '/client/assets/css/',
    img : app.base + '/client/assets/img/',
    js : app.base + '/client/js/',
    models : app.base + '/server/models/',
    public : app.base + '/client/',
    root : app.base,
    views : app.base + '/server/views/'
  };

  app.config = {

    // ### AUTO ROUTER
    // Pog comes with an [auto-router](https://github.com/pogjs/router) module that is enabled by default. But, if you prefer not to use it for any reason, you can disable it here.
    autoRouter : true,

    // ### BOWER
    //
    bower : false, // whether we want to use bower for front-end dependenciees

    // ### BROWSER SYNC
    // The Gulpfile that ships with Pog enables [Browser Sync](http://www.browsersync.io/) by default. If you want to disable it, or customize the port it runs on, you can do so here. You can also remove it if you're not using gulp.
    browserSync : {
      use : true,
      port : 3000, // port to run the server on
    },

    // ### DATABASE
    // Select the database driver you want to use with your models. Currently setup for RethinkDB and MongoDB (with more on the way). Set to false to disable Pog from connecting to any database. Database specific settings can be set in config/db.
    db : false, // rethink, mongo

    // ### CACHE
    // Whether to enable caching.
    cache : false,

    // ### CORS
    // Whether to enable [CORS](https://github.com/evert0n/koa-cors).
    cors : false,

    // ### DEBUG
    // Pog may show more detailed messages in the console with this set to true.
    debug : true,

    // ### ENGINES
    // Pog supports a small handful or html templating languages and css pre-processors out of the box (with more coming soon).
    engines : {
      // ##### HTML
      // Currently supports Handlebars, Jade & Nunjucks
      html : {
        template : 'jade', // options: handlebars | jade | nunjucks
        extension : '.jade' // options: .hbs | .jade | .js
      },
      // ##### CSS
      // Only stylus is working currently. Sass & Less are in the works, but don't seem to working right with iojs yet.
      css : {
        template : 'stylus', // options: (stylus|sass|less) - set false to just use vanilla css
        extension : '.styl' // options: (.styl|.sass|.less)
      },
      cssLibrary : false, // options: (axis|bourbon|nib) - set to false for none
    },

    // ### ERROR REPORTING
    errorReporting : {

      // ##### BROWSER
      // By default, if Pog encounters an error it will display an error page telling you exactly what happened. You may prefer not to display errors in the browser for security reasons, set browser: false and Pog will only display a generic error message in the browser. If you disable this, you will need to check the node/iojs console for more information about errors you may encounter.
      browser: true,

      // FILE
      // When set to true, this will create error logs in the log folder. This is still a bit of a work in progress, so you may not see much showing up here yet.
      file: true

    },

    // ### GZIP
    // Whether to enable [gzip](https://www.npmjs.com/package/koa-gzip) compression or not.
    gzip : true,

    // ### LOGGING
    // Setting this to false will disable Pog from logging anything to the console.
    logging : {
      console : true
    },

    // ### PORT
    // Pog runs on port 1981 be default, you can change that here.
    port : 1980,

    // ### PRETTIFY
    // Tell Pog if you want your output pretty or minified
    prettify : {
      html : true, // whether to pretify html
      css : true, // whether to pretify css
      js : true // whether to pretify js
    },

    // ### POLYFILLS
    // whether to enable [Polyfills](https://github.com/polyfills/polyfills)
    polyfills: false,

    // ### PROTOCOL
    // Whether to use ```http``` or ```https``` by default.
    // This should really be removed and determined automatically.
    // options: (http|https)
    protocol : 'http://',

    // ### SECRET
    // This is mostly a placeholder for future use. It isn't used anywhere yet, but is available to the app should you need a secret for security settings anywhere.
    secret : 'supercalifragilisticexpialidocious',

    // ### SOCKETS
    // Pog is configured with [http://socket.io](socket.io) out of the box, but is not enabled by default. Set this to true and you'll have a socket.io server up and and running.
    sockets : true

  };

  // ### META DATA
  // some default meta settings to inject into the <head>
  app.meta = {
    description : '',
    encoding : 'utf-8',
    keywords : '',
    viewport : 'width=device-width, user-scalable=yes, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0'
  };

};
