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
    build : app.address + '_dist/',
    components : app.address + 'js/components/',
    css : app.address + '_dist/css/',
    img : app.address + 'img/',
    lib : app.address + '_dist/lib/',
    js : app.address + '_dist/js/',
    root : app.address + 'root/',
    socket : app.config.protocol + 'test-server.gabba.io/'
  };

  app.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};