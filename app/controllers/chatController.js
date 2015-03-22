'use strict';

module.exports = function *(gabba) {

  return yield gabba.render('chat', {
    title : gabba.app.name,
    site: gabba.app
  });

};
