'use strict';

module.exports = function(app) {

  const React       = require('react'),
        socket      = require('socket.io-client')(app.public.socket);

  socket.on('connected', function( data ) {
    console.log('socket connected: ');
    console.log(data.connected);
  });

  app.router.get('/', function *() {

    this.render('index', {
      title : app.name,
      site: app
    });

  });

  app.router.get('/login', function *() {

    this.render('login', {
      title : app.name,
      site: app
    });

  });


  app.router.get('/chat/', function *() {

    let Model     = require('../shared/models/user'),
        passport = this.session.passport,
        ReactApp = React.createFactory(require('../shared/components/register.jsx'));

    // TWITTER
    if ( passport._json.profile_image_url ) {passport.avatar = passport._json.profile_image_url.split('_normal').join('');}

    // GITHUB
    if ( passport._json.avatar_url ) { passport.avatar = passport._json.avatar_url; }

    // POPULATE USER DATA
    var User = new Model({
        avatar: passport.avatar,
        name: passport.displayName,
        provider: passport.provider,
        username: passport.username
    });

    this.render('register', {
      title : app.name,
      site: app,
      reactOutput: React.renderToString(new ReactApp(User.attributes))
    });

  });

};
