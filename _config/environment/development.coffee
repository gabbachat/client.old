'use strict'
os = require('os')
require 'colors'

module.exports = (app) ->
  interfaces = os.networkInterfaces()
  addresses = []
  for k of interfaces
    for k2 of interfaces[k]
      address = interfaces[k][k2]
      if address.family == 'IPv4' and !address.internal
        addresses.push address.address
  if typeof addresses[0] == 'undefined'
    addresses[0] = 'localhost'
  # global settings
  app.domain = addresses[0]
  app.env = 'development'
  app.address = app.config.protocol + 'localhost:' + app.config.port + '/'
  # base url
  # DATABASE CONNECTION
  app.config.db =
    adapter: 'mongo'
    host: 'mongodb://coaster:yaketyyak@dogen.mongohq.com:10088/'
    name: 'gabba'
  # directories
  app.public =
    build: app.address + '_dist/'
    components: app.address + 'js/components/'
    css: app.address + '_dist/css/'
    img: app.address + 'img/'
    lib: app.address + '_dist/lib/'
    js: app.address + '_dist/js/'
    socket: app.config.protocol + app.domain + ':1982/'
  console.log 'INFO:'.blue + ' ' + app.env.yellow + ' config loaded'
  return
