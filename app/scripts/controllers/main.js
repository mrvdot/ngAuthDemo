'use strict';

angular.module('ngAuthDemo')
  .controller('MainCtrl', function ($scope, user) {
    $scope.user = user.get();
  });
