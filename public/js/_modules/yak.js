'use strict';

module.exports = function () {

  var port = window.location.port,
      protocol = window.location.protocol + '//',
      host = window.location.hostname;

  return {

    config : {  // GLOBAL CONFIG SETTINGS

      // SET TO FALSE TO DISABLE LOGGING TO CONSOLE
      debug : true,

      // BASE URL'S
      url : {
          base: protocol + host + ( port !== '' ? ':' + port : '') + '/', //BASE URL
      }

    } // END CONFIG

  };

};
