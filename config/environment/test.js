'use strict';

var os = require('os');
    require('colors');

module.exports = function (app) {

  // global settings
  app.domain = 'test.gabba.io';
  app.env = 'production';
  app.address = app.config.protocol + app.domain + '/'; // base url

  // directories
  app.public = {
    build : app.address + 'build/',
    css : app.address + 'css/',
    img : app.address + 'img/',
    lib : app.address + 'components/',
    js : app.address + 'js/',
    root : app.address + 'root/',
    socket : app.config.protocol + 'server-test.gabba.io/'
  };


  app.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};
