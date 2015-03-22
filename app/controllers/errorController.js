'use strict';

// GENERIC ERROR
exports.throwGeneric = function *(gabba) {

	yield gabba.render('errors/default', {
		title : gabba.errorTitle,
		error: gabba.errorMessage,
		site: gabba.app,
		url: gabba.request.originalUrl
	});

};


// 404 ERROR
exports.throw404 = function *(gabba) {

	yield gabba.render('errors/404', {
		title : gabba.errorTitle,
		error: gabba.errorMessage,
		site: gabba.app,
		url: gabba.request.originalUrl
	});

};


// 500 ERROR
exports.throw500 = function *(gabba) {

	yield gabba.render('errors/500', {
		title : gabba.errorTitle,
		error: gabba.errorMessage,
		site: gabba.app,
		url: gabba.request.originalUrl
	});


};
