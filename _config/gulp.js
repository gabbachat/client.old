var app = {};

require('./gabba')(app);
require('./environment/development')(app);

module.exports = {
  app : app,
  server : {
    file: 'server.js',
    type: 'iojs'
  },
  build : {
    css : {
      stylus : './app/public/css/**/*.styl',
      src : './app/public/css/gabba.styl',
      dest : './app/public/_dist/css'
    },
    img : {
      src : './app/public/img/**/*',
      dest : './app/public/_dist/img/'
    },
    js : {
      src : './app/public/_dist/js/gabba.js',
      dest : './app/public/_dist/'
    },
    coffee : {
      src : './app/public/js/*.coffee',
      dest : './app/public/_dist/js'
    },
    coffeeInc : {
      src : './app/public/js/_inc/**/*.coffee',
      dest : './app/public/_dist/js/_inc'
    },
    jsx : {
      src : './app/public/js/components/**/*.cjsx',
      dest : './app/public/_dist/js/components/'
    }
  },
  bower : './lib/bower',
  lib : './lib',
  watch : {
    coffee : './app/public/app/**/*.coffee',
    css : './app/public/_dist/css/gabba.css',
    jade : './app/views/**/*.jade',
    img : './app/public/img/**/*',
    js : './app/public/js/**/*.js',
    react : './shared/components/**/*.cjsx',
    stylus : './app/public/css/**/*.styl'
  }
};
