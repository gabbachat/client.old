rootPath = require('path').normalize(__dirname + '/..')

module.exports = (app) ->

  app.name = 'Gabba' # APP NAME

  # DIRECTORIES
  app.dir =
    build: app.base + '/app/public/_dist/'
    controllers: app.base + '/app/controllers/'
    bower: app.base + '/lib/bower/'
    components: app.base + '/app/public/js/components/'
    css: app.base + '/app/public/_dist/css/'
    img: app.base + '/app/public/img/'
    js: app.base + '/app/public/js/'
    models: app.base + '/app/models/'
    public: app.base + '/app/public/'
    root: app.base
    views: app.base + '/app/views/'

  # CONFIG
  app.config =

    # ENABLE BROWER SYNC
    browserSync:
      use: true
      port: 3000

    cache: false # ENABLE CACHING
    cors: false # ALLOW CROSS-SITE REQUESTS
    # debug: true # ENABLE DEBUG MODE

    # ENABLE ERROR REPORTING
    errorReporting:
      browser: true
      file: true

    gzip: true # ENABLE G-ZIP

    # LOGGING OPTIONS
    logging:
      console: true
      file: true

    # PASSPORT SETTINGS
    passport:
      facebook: false
      google: false
      github:
        callback: 'auth/github/callback'
        key: '02d39b00dcaaa6455d8c'
        secret: '041febbf7affe8b01371b6485f3a1cdb178e2d62'
      twitter:
        callback: 'auth/twitter/callback'
        key: 'Nz1naeWd8lY7KrWGmOqUAGA8h'
        secret: '66sMmUVvMySNBhT3azWVNr8Z7nM95VY4d1XwF31Hv1HVayIXnh'


    port: 1981 # PORT TO RUN ON

    # PRETIFY OUTPUT
    prettify:
      html: true
      css: true
      js: true

    polyfills: false # ENABLE SERVER-SIDE POLYFIL
    protocol: 'http://' # DEFAULT PROTOCOL
    secret: 'supercalifragilisticexpialidocious' # APP SECRET
    sockets: true # ENABLE SOCKET.IO

  # META DATA
  app.meta =
    description: ''
    encoding: 'utf-8'
    keywords: ''
    viewport: 'width=device-width, user-scalable=yes, initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0'

  return
