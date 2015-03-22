'use strict';

var path = require('path'),
rootPath = path.normalize(__dirname + '/..');

module.exports = function (app) {

  app.name = 'gabba'; // the name of your app

  // APP DIRECTORIES
  app.dir = {
    controllers : app.base + '/app/controllers/',
    components : app.base + '/public/components/',
    css : app.base + '/public/css/',
    img : app.base + '/public/img/',
    js : app.base + '/public/js/',
    models : app.base + '/app/models/',
    public : app.base + '/public/',
    root : app.base,
    views : app.base + '/app/views/'
  };

  app.config = {

    autoRouter : true, // whether or not to use the auto routing system (https://github.com/gabbajs/router)

    bower : true, // whether we want to use bower for front-end dependenciees

    browserSync : {
      use : true,
      port : 3000, // port to run the server on
    },

    db : false, // rethink, mongo, couch, redis, mysql, postgress

    cache : false, // whether to use caching

    cors : false, // enable CORS - https://github.com/evert0n/koa-cors

    debug : true, // enable or disable console logging

    // set your html & css template engine
    engines : {
      html : {
        template : 'jade', // options: (handlebars|jade|nunjucks)
        extension : '.jade' // options: (.hbs|.jade|.js)
      },
      css : {
        template : 'stylus', // options: (stylus|sass|less) - set false to just use vanilla css
        extension : '.styl' // options: (.styl|.sass|.less)
      },
      cssLibrary : false, // options: (axis|bourbon|nib) - set to false for none
    },

    // defines when and where errors will be reported
    errorReporting : {
      // whether to send error message to browser, or display a generic error.
      // check the node console for errors if you set this to false.
      browser: true,

      // write errors to /log/gabba.log files
      // this needs work, doesn't log much yet
      file: true
    },

    gzip : true, // whether to enable gzip compression

    logging : {
      console : true // whether to allow gabba to log messages to the node console
    },

    port : 1981, // port to run the server on

    prettify : {
      html : true, // whether to pretify html
      css : true, // whether to pretify css
      js : true // whether to pretify js
    },

    polyfills: false, // whether to enable polyfills (https://github.com/polyfills/polyfills)

    protocol : 'http://', // options: (http|https)

    secret : 'supercalifragilisticexpialidocious', // placeholder for now, will be implemented later

    socket : false // whether to enable socket.io

  };

  // some default meta settings for <head>
  app.meta = {
    description : '',
    encoding : 'utf-8',
    keywords : '',
    viewport : 'width=device-width, user-scalable=yes, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0'
  };

};
