var app = {};

require('./pog')(app);
require('./environment/development')(app);

module.exports = {
  app : app,
  server : {
    file: 'server.js',
    type: 'iojs'
  },
  build : {
    css : {
      stylus : './client/assets/css/**/*.styl',
      src : './client/assets/css/gabba.styl',
      dest : './client/_dist/css'
    },
    img : {
      src : './client/img/**/*',
      dest : './client/_dist/img/'
    },
    js : {
      src : './client/js/gabba.js',
      dest : './client/_dist/js'
    }
  },
  polymerTemplates : {
    src : './client/templates/*.jade',
    dest : './client/_dist/templates/'
  },
  bower : './client/_bower',
  lib : './client/lib',
  watch : {
    css : './client/_dist/css/gabba.css',
    jade : './server/views/**/*.jade',
    img : './client/img/**/*',
    js : './client/js/**/*',
    stylus : './client/css/**/*.styl'
  }
}
