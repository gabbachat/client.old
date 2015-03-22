'use strict';

const $       = require('jquery-browserify'),
      angular = require('angular-browserify');
      // gabba   = window.gabba = require('./_modules/gabba')();


var myApp = angular.module('gabba', []);

myApp.controller('login', function ($scope) {

  console.log('angular loaded');

  $scope.title = 'Gabba Login';
  $scope.name = 'Jiminy Cricket';
  $scope.email = 'jiminy@cricket.com';

});
