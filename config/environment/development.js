'use strict';

var os = require('os');
    require('colors');

module.exports = function (app) {

  var interfaces = os.networkInterfaces(),
      addresses = [];

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
  app.address = app.config.protocol + app.domain + ':'  + app.config.port + '/'; // base url

  // directories
  app.public = {
    build : app.address + 'build/',
    components : app.address + 'components/',
    css : app.address + 'css/',
    img : app.address + 'img/',
    lib : app.address + 'components/',
    js : app.address + 'js/',
    root : app.address + 'root/',
    socket : app.config.protocol + 'localhost:1982/',
  };

  console.log('INFO:'.blue + ' ' + app.env.yellow + ' config loaded' );

};
