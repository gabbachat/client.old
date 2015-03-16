'use strict';

var os = require('os');
    require('colors');

module.exports = function (app) {

  // global settings
  app.domain = 'yak.herokuapp.com';
  app.env = 'production';
  app.address = app.config.protocol + app.domain + '/'; // base url

  // directories
  app.public = {
    build : app.address + 'build/',
    css : app.address + 'css/',
    img : app.address + 'img/',
    lib : app.address + 'components/',
    js : app.address + 'js/',
    root : app.address + 'root/'
  };


  app.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};
