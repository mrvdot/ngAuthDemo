'use strict';

angular.module('ngAuthDemo')
  .controller('LoginCtrl', function ($scope, $location, user) {
    $scope.user = {};

    // Make sure user isn't already logged in
    user.get(function (userInfo) {
      if (userInfo) {
        $location.path('/app');
      };
    });

    $scope.authenticateUser = function () {
      user.register($scope.user.username, $scope.user.password, function (complete) {
        if (complete === false) {
          alert('Failed to create that user, or login them in, sorry');
          return;
        };
        $location.path('/app');
      });
    }
  });