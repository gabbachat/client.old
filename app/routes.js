// THIS FILE IS AUTO-INCLUDED BY SERVER.JS
// IF YOU WANT TO USE ANY CUSTOM ROUTES ON TOP OF THE AUTO ROUTER, THEY CAN GO HERE

'use strict';

module.exports = function(app) {

  const _ = require('koa-route');

  app.use(_.get('/:chat/:room', function *(term, room) {

    return yield this.render('chat', {
      title : app.name,
      site : app,
      room : room
    });

  }));

};
