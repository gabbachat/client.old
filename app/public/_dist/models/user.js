'use strict';
module.exports = function(app) {
  var Waterline, moment;
  console.log('MODEL:user loaded');
  moment = require('moment');
  Waterline = require('waterline');
  return Waterline.Collection.extend({
    identity: 'user',
    connection: 'compose',
    attributes: {
      _id: 'string',
      auth: 'object',
      social: 'object',
      profile: 'object',
      session: 'object',
      rooms: 'array'
    }
  });
};
