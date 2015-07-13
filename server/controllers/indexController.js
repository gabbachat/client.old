'use strict';

module.exports = function *(pog) {

	console.log('index loaded');
	console.log(pog.app.name);
	console.log(pog.app);

  pog.render('index', {
    title : pog.app.name,
    site: pog.app
  });

	yield;

};
