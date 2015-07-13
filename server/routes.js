'use strict';

module.exports = function(app) {

  app.use(function *(){

    this.render('index', {
      title : app.name,
      site: app
    });

  });

};
