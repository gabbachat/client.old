'use strict';

module.exports = function *(gabba) {

	console.log('index loaded');
	console.log(gabba.app.name);
	console.log(gabba.app);

  gabba.render('index', {
    title : gabba.app.name,
    site: gabba.app
  });

	yield;

};
