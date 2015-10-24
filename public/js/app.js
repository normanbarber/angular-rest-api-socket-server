'use strict';

angular.module('restexample', ['rest.services', 'Controllers', 'ngCookies', 'ngRoute']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
	$locationProvider.html5Mode(true);
}]);
