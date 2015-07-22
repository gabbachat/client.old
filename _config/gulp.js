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
      stylus : './app/public/client/css/**/*.styl',
      src : './app/public/client/css/gabba.styl',
      dest : './app/public/css/_dist'
    },
    img : {
      src : './app/public/img/**/*',
      dest : './app/public/_dist/img/'
    },
    js : {
      src : './client/app/gabba.js',
      dest : './app/public/_dist/js'
    },
    react : {
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
    stylus : './app/public/client/css/**/*.styl'
  }
};
