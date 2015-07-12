// THIS FILE IS AUTO-INCLUDED BY SERVER.JS
// IF YOU WANT TO USE ANY CUSTOM ROUTES ON TOP OF THE AUTO ROUTER, THEY CAN GO HERE

'use strict';

module.exports = function(app) {

  const _ = require('koa-route');

  app.use(function *(room) {

    return yield this.render('index', {
      title : app.name,
      site : app
    });

  });

  // app.use(_.get('/group/:room', function *(room) {
  //
  //   var slogan = 'Greetings earthling! Welcome to the ' + room + ' room!';
  //
  //   if ( room === 'spam' ) {
  //     slogan = 'Spam! Lovely spam! Lovely spam!';
  //   } else if ( room === 'seattle' ) {
  //     slogan = 'Would the last person to leave seattle please turn out the lights?';
  //   } else {
  //     slogan = 'Greetings earthling! Welcome to the ' + room + ' room!';
  //   }
  //
  //       console.log('load view for room:');
  //       console.log(room);
  //   // console.log('loading room: ' + room);
  //
  //   return yield this.render('chat', {
  //     title : app.name,
  //     site : app,
  //     room : room,
  //     slogan : slogan
  //   });
  //
  // }));

};
