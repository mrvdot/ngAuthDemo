'use strict';

angular
  .module('ngAuthDemo')
  .controller('AppCtrl', function ($scope, user) {
    $scope.user = user.get();
  })