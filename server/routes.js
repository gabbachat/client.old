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
        session = this.session,
        passport = this.session.passport,
        authorized = [],
        userInfo = '',
        github = null,
        twitter = null,
        githubProfile = {
          id: null,
          handle: null,
          info: null,
          avatar: null,
          url: null,
          name: null,
          location: null
        },
        twitterProfile = {
          id: null,
          handle: null,
          info: null,
          avatar: null,
          url: null,
          name: null,
          location: null
        },
        ReactApp = React.createFactory(require('../shared/components/register.jsx'));

    // TWITTER
    if ( passport._json.profile_image_url ) {
      passport.avatar = passport._json.profile_image_url.split('_normal').join('');

      authorized.push = 'twitter';

      twitter = passport._json.id;

      twitterProfile = {
        id: passport._json.id,
        handle: passport._json.screen_name,
        info: passport._json.description,
        avatar: passport._json.profile_image_url,
        url: passport._json.url,
        name: passport._json.name,
        location: passport._json.location
      };

    }

    // GITHUB
    if ( passport._json.avatar_url ) {
      passport.avatar = passport._json.avatar_url;

      authorized.push = 'github';

      github = passport._json.id;

      githubProfile = {
        id: passport._json.id,
        handle: passport._json.login,
        info: passport._json.bio,
        avatar: passport._json.avatar_url,
        url: passport._json.html_url,
        name: passport._json.name,
        location: passport._json.location
      };

    }

    // POPULATE USER DATA
    var User = new Model({
        _id : null,
        auth: {
          provider : passport.provider,
          token : session.token,
          secret : session.secret
        },
        github : github,
        twitter : twitter,
        social : {
          github: githubProfile,
          twitter: twitterProfile
        },
        profile: {
          avatar: {
            provider: passport.provider,
            src: passport.avatar,
          },
          email: null,
          info: userInfo,
          location: passport._json.location,
          name: passport.displayName,
          password: null,
          username: passport.username
        },
        session : {
          id : null,
          logged_in : false,
          room : null,
          status : null
        },
        rooms : []
    });

    this.render('register', {
      title : app.name,
      site: app,
      reactOutput: React.renderToString(new ReactApp(User.attributes))
    });

  });

};
