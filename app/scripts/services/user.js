'use strict'

angular
  .module('ngAuthDemo')
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('userAuthInterceptor');
  })
  .value('userApiUrl', 'http://ngAuth.mvd-apis.info')
  .factory('userAuthInterceptor', function ($q, userApiUrl) {
    return {
      request : function (config) {
        // Check to see if we're explicitly bypassing auth for this
        // and that the call is going to the api we want to authenticate for
        if (!config.bypassAuth && config.url.indexOf(userApiUrl) == 0) {
          // Pass along cookies with our ajax request
          config.withCredentials = true
        };
        return config;
      }
    }
  })
  .factory('userApi', function ($http, userApiUrl) {
    return {
      load : function () {
        return $http.get(userApiUrl + '/load')
      },
      register : function (username, password) {
        return $http.post(
          userApiUrl + '/register',
          {
            username: username,
            password: password
          },
          {
            bypassAuth: true
          });
      }
    }
  })
  .factory('user', function ($timeout, $cookies, userApi) {
    var user = {}
      , loadUser = function (cb) {
          // check if user obj is fully loaded
          if (!user.id) {
            userApi.load()
              .success(function (response) {
                angular.extend(user, response.result);
                cb && cb(user);
              })
              .error(function(err) {
                console.warn(err);
                cb && cb(false);
              });
          } else if (cb) {
            $timeout(function () {
              cb(user);
            });
          }
          return user;
        }
      , registerUser = function (cb) {
          userApi.register(username, password)
            .success(function (response) {
              angular.extend(user, response.result);
              cb && cb(user);
            })
            .error(function(err) {
              console.warn(err);
              cb && cb(false);
            });
          return user;
        }

    return {
      get : function () {
        return loadUser();
      },
      register : function (username, password) {
        return registerUser();
      }
    }
  })