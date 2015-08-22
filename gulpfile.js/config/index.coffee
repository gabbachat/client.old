app = {}

require('../../_config/gabba') app
require('../../_config/environment/development') app

module.exports =

  app: app

  server:

    file: 'server.js'
    type: 'iojs'

  build:

    css:
      stylus: './app/public/css/**/*.styl'
      src: './app/public/css/gabba.styl'
      dest: './app/public/_dist/css'

    img:
      src: './app/public/img/**/*'
      dest: './app/public/_dist/img/'

    js:
      src: './app/public/_dist/js/gabba.js'
      dest: './app/public/_dist/'

    coffee:
      src: './app/public/js/*.coffee'
      dest: './app/public/_dist/'

    coffeeModels:
      src: './app/models/**/*.coffee'
      dest: './app/public/_dist/models'

    coffeeModules:
      src: './app/public/js/modules/**/*.coffee'
      dest: './app/public/_dist/js/modules'

  bower: './lib/bower'

  lib: './lib'

  watch:
    coffee: './app/public/js/*.coffee'
    coffeeModels: './app/models/**/*.coffee'
    coffeeModules: './app/public/js/modules/**/*.coffee'
    css: './app/public/_dist/css/gabba.css'
    jade: './app/views/**/*.jade'
    img: './app/public/img/**/*'
    js: './app/public/js/**/*.js'
    react: './shared/components/**/*.cjsx'
    stylus: './app/public/css/**/*.styl'
