'use strict';

var $ = require('jquery-browserify');


// GET BASIC BROWSER INFO
exports.info = function ( which ) {

  var ua = navigator.userAgent.toLowerCase(),
      platform = navigator.platform.toLowerCase(),
      UA = ua.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0],
      mode = UA[1] === 'ie' && document.documentMode;

  if ( which === 'name' ) {
      return (UA[1] === 'version') ? UA[3] : UA[1];
  } else if ( which === 'version' ) {
      return mode || parseFloat((UA[1] === 'opera' && UA[4]) ? UA[4] : UA[2]);
  }

};

exports.domain = function () {
  return window.location.hostname;
};

exports.forward = function(url, time) {

  // DELAY REDIRECT IF REQUESTED
  if (typeof time !== 'undefined') {
    setTimeout(function() {
      if (url !== false) location.href = url;
    }, time * 1000);

    // OTHERWISE REDIRECT IMMEDIATELY
  } else {
    if (url !== false)  window.location = url;
  }

};

// GO TO A SPECIFIC URL
exports.go = function ( url ) {
  window.location.href = url;
};

// RETURN CURRENT PAGE NAME
exports.page = function () {

  var path = location.pathname.split('/');

  return path.slice(-1)[0];

};

// RETURN CURRENT PATH
exports.path = function () {
  return location.pathname;
};

// QUERY URI FOR A 'GET' PARAM
exports.query = function ( term ) {

  var data = false,
      loc = location.search,
      q = loc.split('?'),
      query = '&' + q[1],
      parts = query.split('&');

  $.each(parts, function(index, value) {

    if (value.indexOf(term) !== -1) {
      data = value.split('=');
      data = data[1];
    }

  });

  return data;

};


// RETURN SPECIFIC URL SEGMENT
exports.segment = function ( num ) {

  return location.pathname.split('/')[num];

};

// GET CURRENT URL
exports.url = function () {

  var protocol = window.location.protocol + '//',
      port = window.location.port,
      host = window.location.hostname;

  return protocol + host + (port !== '' ? ':' + port : '') + '/';

};

exports.size = function ( which ) {

  if ( !arguments[1] ) {

    if ( which === 'height' || which === 'h' ) {
      return window.outerHeight;
    } else if ( which === 'width' || which === 'w' ) {
      return window.outerWidth;
    }

  } else if ( arguments[1] === 'inner' ) {
    if ( which === 'height' || which === 'h' ) {
      return window.innerHeight;
    } else if ( which === 'width' || which === 'w' ) {
      return window.innerWidth;
    }
  }

};
