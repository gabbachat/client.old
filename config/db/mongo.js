module.exports = function (app) {

  require('colors'); // PRETTY CONSOLE LOGGING

  app.log('INFO: '.blue + 'using ' + 'mongodb'.yellow + ' as gabba database.');

  app.db = require('mongoose');

};
