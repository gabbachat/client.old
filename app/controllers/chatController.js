'use strict';

module.exports = function *(pog) {

  return yield pog.render('chat', {
    title : pog.app.name,
    site: pog.app
  });

};
