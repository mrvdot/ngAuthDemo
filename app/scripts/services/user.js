'use strict';

angular
  .module('ngAuthDemo')
  .config(function ($httpProvider) {
    $httpProvider.interceptors.push('userAuthInterceptor');
  })
  .value('userApiUrl', 'http://ngAuth.mvd-apis.info')
  .factory('userAuthInterceptor', function ($rootScope, userApiUrl, userAuth) {
    var _currentPath;
    // For circular dependency reasons, we use rootScope events
    // instead of requesting $route directly
    $rootScope.$on('$routeChangeStart', function (ev, newRoute) {
      _currentPath = newRoute.originalPath;
    });
    return {
      request : function (config) {
        // Check to see if we're explicitly bypassing auth for this
        // and that the call is going to the api we want to authenticate for
        if (!config.bypassAuth && config.url.indexOf(userApiUrl) === 0) {
          // Pass along cookies with our ajax request
          config.withCredentials = true;
        }
        return config;
      }
    }
  })
  .provider('userAuth', function userAuthProvider () {
    var _whiteList = []
      , provider = this;

    // Whitelist a route, either exact string or RegExp
    provider.whitelistRoute = function (route) {
      if (angular.isString(route)) {
        route = new RegExp(route);
      } else if (!angular.isObject(route) || !angular.isFunction(route.test)) {
        console.warn('Invalid route type passed to whitelistRoute, must be string or RegExp', route);
        return false;
      }
      _whiteList.push(route);
    }

    provider.$get = function () {
      return {
        // given a string as route, check if it's whitelisted
        // if any in whitelist return true, pass. Else reject
        whitelisted : function (route) {
          var pass = false;
          for (var i = 0, ii = _whiteList.length; i < ii; i++) {
            pass = _whiteList[i].test(route);
            if (pass) {
              break;
            };
          }
          return pass;
        }
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
      , registerUser = function (username, password, cb) {
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
      get : function (callback) {
        return loadUser(callback);
      },
      register : function (username, password, callback) {
        return registerUser(username, password, callback);
      }
    }
  })