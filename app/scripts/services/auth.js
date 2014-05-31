'use strict';

angular
  .module('ngAuthDemo')
  .factory('authApi', function ($cookies, $http) {
    var cookiePrefix = 'ngAuthDemo-'
      , baseUrl = 'http://ngAuth.mvd-apis.info'
      , _apiKey;

    return {
      init : function () {
        if (!(_apiKey = $cookies[cookiePrefix + 'apiKey'])) {
          $http.post(baseUrl + '/_auth/init')
            .success(function (response) {
              if (response.key) {
                $cookies[cookiePrefix + 'apiKey'] = _apiKey = response.key;
              } else {
                console.warn('No API key returned from server in response', response);
              }
            })
            .error(function (err) {
              console.warn('Server errored when requesting API key', err);
            });
        };
      }
    }
  });