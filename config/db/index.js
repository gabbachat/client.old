module.exports = function (app) {

  require('colors'); // PRETTY CONSOLE LOGGING

  if ( app.config.db === 'rethink' || app.config.db === 'rethinkdb' ) require(app.base + '/config/db/rethink')(app);
  else if ( app.config.db === 'mongo' || app.config.db === 'mongodb' ) require(app.base + '/config/db/mongo')(app);

};
