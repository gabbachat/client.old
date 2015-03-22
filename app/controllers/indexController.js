'use strict';

module.exports = function *(gabba) {

  return yield gabba.render('index', {
    title : gabba.app.name,
    site: gabba.app
  });

};
