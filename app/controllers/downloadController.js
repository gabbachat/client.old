'use strict';

module.exports = function *(pog) {

  return yield pog.render('download', {
    title : pog.app.name,
    site: pog.app
  });

};
