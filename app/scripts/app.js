'use strict';

angular
  .module('ngAuthDemo', [
    'ngCookies',
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/login', {
        templateUrl : 'views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/app', {
        templateUrl : 'views/app.html',
        controller: 'AppCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .run(function(mvdApi) {
    mvdApi.init();
  });
