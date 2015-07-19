'use strict';

module.exports = function(app) {

  const CookieDough = require('cookie-dough'),
        React       = require('react'),
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


  app.router.get('/chat', function *() {

    let passport = this.session.passport,
        ReactApp = React.createFactory(require('../shared/register.jsx'));

    console.log('PASSPORT');
    // console.log(passport);

    if ( passport._json.profile_image_url ) {
      passport.avatar = passport._json.profile_image_url.split('_normal').join('');
    }

    if ( passport._json.avatar_url ) {
      passport.avatar = passport._json.avatar_url;
    }


    let reactHtml = React.renderToString(new ReactApp({
      avatar : passport.avatar,
      name : passport.displayName,
      username: passport.username
    }));

    // console.log(reactHtml);

    // let passport = this.session.passport;

    this.render('register', {
      title : app.name,
      site: app,
      reactOutput: reactHtml
      // passport: passport
    });

  });

  app.router.get('/chatOld', function *() {

    // IF WE HAVE A VALID SESSION
    if ( this.session.passport.id ) {

      let passport = this.session.passport,
          render = this.render;

      // console.log(this.session.passport);

      // socket.emit('user:login', passport);
      //
      // // NEW USER, SHOW SIGN UP OPTIONS
      // socket.on('user:register', function( data ) {
      //   console.log('USER REGISTRATION STATUS:');
      //   console.log(data);
      //
      //   // DISPLAY APPLICATION
      //   render('register', {
      //     title : app.name,
      //     site: app,
      //     passport: passport
      //   });
      //
      // });
      //
      //
      // // EXISTING USER, DISPLAY APPLICATION
      // socket.on('user:login', function( data ) {
      //   console.log('USER LOGIN STATUS:');
      //   console.log(data);
      //
      //   // DISPLAY APPLICATION
      //   render('chat', {
      //     title : app.name,
      //     site: app,
      //     passport: passport
      //   });
      //
      // });

      if ( passport._json.profile_image_url ) {
        passport.avatar = passport._json.profile_image_url.split('_normal').join('');
      }

      if ( passport._json.avatar_url ) {
        passport.avatar = passport._json.avatar_url;
      }

      // let cookie = require('cookie-dough')();

      // var cookie = new CookieDough(this.req);

      this.cookies.set('tester', 'blah blah blah');

      // DISPLAY APPLICATION
      this.render('register', {
        title : app.name,
        site: app,
        passport: passport
      });


    // IF NOT, LOGIN
    } else {
      console.log('NOT LOGGED IN');
      console.log(this.session);
      this.render('login', {
        title : app.name,
        site: app
      });
    }


  });

};
