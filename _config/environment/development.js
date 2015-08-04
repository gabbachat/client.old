'use strict';

var os = require('os');
    require('colors');

module.exports = function (app) {

  var interfaces = os.networkInterfaces();
  var addresses = [];
  for (var k in interfaces) {
    for (var k2 in interfaces[k]) {
      var address = interfaces[k][k2];
      if (address.family === 'IPv4' && !address.internal) {
        addresses.push(address.address);
      }
    }
  }

  if ( typeof addresses[0] === 'undefined' ) addresses[0] = 'localhost';

  // global settings
  app.domain = addresses[0];
  app.env = 'development';
  // app.address = app.config.protocol + app.domain + ':'  + app.config.port + '/'; // base url
  app.address = app.config.protocol + 'localhost:'  + app.config.port + '/'; // base url


  // directories
  app.public = {
    build : app.address + '_dist/',
    components : app.address + 'js/components/',
    css : app.address + '_dist/css/',
    img : app.address + 'img/',
    lib : app.address + '_dist/lib/',
    js : app.address + '_dist/js/',
    socket : app.config.protocol + app.domain + ':1982/'
  };

  console.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};