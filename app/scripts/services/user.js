'use strict';

angular
  .module('ngAuthDemoUser', [])
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
        // Confirm that this call is going to the api we want to authenticate for
        if (config.url.indexOf(userApiUrl) === 0) {
          // Pass along cookies with our ajax request
          config.withCredentials = true;
        }
        // If not authorized yet, defer any request that's not explicitly
        // bypassed or whitelisted
        if (!userAuth.isAuthorized()) {
          if (!config.bypassAuth && !userAuth.whitelisted(_currentPath)) {
            return userAuth.deferUntilAuthorized(config);
          };
        };
        return config;
      }
    }
  })
  .provider('userAuth', function () {
    var _whiteList = []
      , _isAuthorized = false;

    // Whitelist a route, either exact string or RegExp
    this.whitelistRoute = function (route) {
      if (angular.isString(route)) {
        // Only match string exactly
        route = new RegExp('^' + route + '$');
      } else if (!angular.isObject(route) || !angular.isFunction(route.test)) {
        console.warn('Invalid route type passed to whitelistRoute, must be string or RegExp', route);
        return false;
      }
      _whiteList.push(route);
    }

    this.$get = ['$q', '$rootScope', function ($q, $rootScope) {
      var methods = {
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
        },
        isAuthorized: function () {
          return _isAuthorized;
        },
        authorize : function (val) {
          _isAuthorized = val;
          if (val) {
            $rootScope.$broadcast('userAuthorized');
          };
        },
        checkAuth: function (defer, config) {
          return config
        },
        deferUntilAuthorized: function (value) {
          var defer = $q.defer();
          if (methods.isAuthorized()) {
            defer.resolve(value);
          } else {
            var off = $rootScope.$on('userAuthorized', function () {
              off();
              defer.resolve(value);
            });
          }
          return defer.promise;
        }
      }
      return methods;
    }];
  })
  .factory('userApi', function ($http, userApiUrl) {
    return {
      load : function () {
        return $http.get(userApiUrl + '/load', {
          bypassAuth: true
        })
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
  .factory('user', function ($timeout, $cookies, userApi, userAuth) {
    var user = {}
      , loadUser = function (cb) {
          // check if user obj is fully loaded
          if (!user.username) {
            userApi.load()
              .success(function (response) {
                userAuth.authorize(true);
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
              userAuth.authorize(true);
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