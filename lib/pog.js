module.exports = function (app) {

	return {

		inform: function( app, type, msg ) {

			if ( typeof msg === 'undefined') msg = false;

			if ( type === 'start') {
				this.log(' ');
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.blue);
				this.log('      FIRING UP THE POG SERVER, STAND BY FOR LAUNCH. '.white);
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.blue);
				this.log(' ');
			} else if( type === 'done' ) {
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.rainbow);
				this.log('              ALL SET. EVERYTHING IS AWESOME! '.white);
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.rainbow);
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.grey);
				this.log('Point your browser to: '.white + app.address.magenta);
				// this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # # # #'.grey);
			} else if( type === 'eaddr' ) {
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red);
				this.log(' ');
				this.log('     OH NOES! Pog Server Failed to start! :( '.yellow);
				this.log(' ');
				this.log('It looks like something is already running on port ' + app.config.port );
				this.log('Please double check that Pog is not already running' );
				this.log('If you continue to see this error, you should update the');
				this.log('port number in your config file (config/_settings.js)');
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red);
				this.log(' ');
			} else if ( type === 'error' ) {
				this.log(' ');
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red);
				this.log('ERROR:');
				this.log(msg.white);
				this.log('# # # # # # # # # # # # # # # # # # # # # # # # # # # #'.red);
			}

		},

		// ALLOW POG LOGGING TO BE TURNED OFF IN CONFIG
		log: function(what) {
			if ( app.config.logging.console === true ) console.log(what);
		},

		emptyObject: function(obj) {
		  return !Object.keys(obj).length;
		},

		countObject: function(obj) {
			var count = 0;
			for( var key in obj ) {
			  if(obj(key)) {
			    count++;
			  }
			}

			return count;
		},

		throw: function(num) {

			var code = {
				400 : '400 Bad Request',
				401 : '401 Unauthorized',
				403 : '403 Forbidden',
				404 : '404 Not Found',
				405 : '405 Method Not Allowed',
				500 : '500 Internal Server Error',
			};

			var err = new Error( code[num] );
			    err.code = num;
			    err.message = code[num];
			    err.status = num;

			return err;

		},

		throwError : function *(err) {

      err.pog.status = err.code;

      if ( typeof err.stack !== 'undefined' ) {
        app.log('ERROR: '.red + err.stack);
      } else {
        app.log('ERROR: '.red + err.message);
      }

      if ( app.config.errorReporting.browser === true ) {
        err.pog.errorTitle = err.title;
        err.pog.errorMessage = err.message;
      } else {
        err.pog.errorTitle = 'Internal Server Error';
        err.pog.errorMessage = 'The server has encountered an unexpected error and cannot continue';
      }
      var controller = require(app.base + '/app/controllers/errorController.js');

      if ( err.code  === 404 ) {
        return yield controller.throw404(err.pog).next();
      } else if ( err.code  === 500) {
        return yield controller.throw500(err.pog).next();
      } else {
        return yield controller.throwGeneric(err.pog).next();
      }


    }

	};

};
