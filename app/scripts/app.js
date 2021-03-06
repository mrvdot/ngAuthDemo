'use strict';

angular
  .module('ngAuthDemo', [
    'ngCookies',
    'ngRoute',
    'ngAuthDemoUser'
  ])
  .config(function ($routeProvider, userAuthProvider) {
    userAuthProvider.whitelistRoute('/');
    userAuthProvider.whitelistRoute('/login');
    
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
  .run(function(mvdApi, user) {
    mvdApi.init(function () {
      user.get();
    });
  });
