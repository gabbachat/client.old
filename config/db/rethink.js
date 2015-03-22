module.exports = function (app) {

  require('colors'); // PRETTY CONSOLE LOGGING

  app.log('INFO: '.blue + 'using ' + 'rethinkdb'.yellow + ' as gabba database.');

  app.db = require('thinky')();

};
