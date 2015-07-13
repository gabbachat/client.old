'use strict';

// GENERIC ERROR
exports.throwGeneric = function *(pog) {

	pog.render('errors/default', {
		title : pog.errorTitle,
		error: pog.errorMessage,
		site: pog.app,
		url: pog.request.originalUrl
	});

	yield;

};


// 404 ERROR
exports.throw404 = function *(pog) {

	pog.render('errors/404', {
		title : pog.errorTitle,
		error: pog.errorMessage,
		site: pog.app,
		url: pog.request.originalUrl
	});

	yield;

};


// 500 ERROR
exports.throw500 = function *(pog) {

	pog.render('errors/500', {
		title : pog.errorTitle,
		error: pog.errorMessage,
		site: pog.app,
		url: pog.request.originalUrl
	});

	yield;

};
