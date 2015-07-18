'use strict';

module.exports = function(app) {

  // app.router.get('/auth/twitter', function *() {
  //     this.body = 'twitter';
  // });

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

    console.log('SESSION STATUS');
    console.log(this.session);

    this.render('chat', {
      title : app.name,
      site: app
    });

  });

};
