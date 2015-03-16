'use strict';

module.exports = function *(pog) {

  return yield pog.render('index', {
    title : pog.app.name,
    site: pog.app
  });

};
