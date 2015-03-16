'use strict';

var os = require('os');
    require('colors');

module.exports = function (app) {

  // global settings
  app.domain = 'test.mydomain.com';
  app.env = 'test';
  app.address = app.config.protocol + app.domain + '/'; // base url

  // directories
  app.public = {
    components : app.address + 'components/',
    css : app.address + 'css/',
    img : app.address + 'img/',
    lib : app.address + 'lib/',
    js : app.address + 'js/'
  };

  app.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};
