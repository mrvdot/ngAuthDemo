'use strict';

angular
  .module('ngAuthDemo')
  .config(function ($httpProvider, userAuthProvider) {
    $httpProvider.interceptors.push('mvdApiInterceptor');

  })
  .value('mvdApiUrl', 'http://ngAuth.mvd-apis.info')
  .factory('mvdApiInterceptor', function ($q, mvdAccount, mvdApiUrl) {
    return {
      request : function (config) {
        // Confirm this request is going to API server
        if (config.url.indexOf(mvdApiUrl) == 0) {
          mvdAccount.setHeaders(config);
        };
        return config;
      },
      responseError : function (response) {
        if (response.status == 401) {
          mvdAccount.clearSession();
        };
        return $q.reject(response);
      }
    }
  })
  .factory('mvdAccount', function ($cookies, $cookieStore) {
    var cookiePrefix = 'ngAuthDemo-'
      , _acct
      , _apiSession;

    return {
      getSession : function () {
        return _apiSession || (_apiSession = $cookies[cookiePrefix + 'apiSession']);
      },
      setSession : function (session) {
        return _apiSession = $cookies[cookiePrefix + 'apiSession'] = session;
      },
      clearSession : function () {
        $cookies[cookiePrefix + 'apiSession'] = _apiSession = undefined;
      },
      getAccount : function () {
        return _acct || (_acct = $cookieStore.get(cookiePrefix + 'accountInfo'));
      },
      setAccount : function (account) {
        _acct = account;
        $cookieStore.put(cookiePrefix + 'accountInfo', account);
        return _acct;
      },
      setHeaders : function(config) {
        var authHeaders = {};
        if (_apiSession) {
          authHeaders = {
            'x-ngauth-session' : _apiSession
          }
        } else if (_acct) {
          authHeaders = {
            'x-ngauth-account': _acct.slug,
            'x-ngauth-key': _acct.apikey
          }
        }
        config.headers || (config.headers = {});
        angular.extend(config.headers, authHeaders);
      }
    }
  })
  .factory('mvdApi', function ($http, $timeout, mvdAccount, mvdApiUrl) {
    return {
      init : function (cb) {
        var apiSession, account;
        if (!(apiSession = mvdAccount.getSession())) {
          if (account = mvdAccount.getAccount()) {
            $http.post(mvdApiUrl + '/_auth/authenticate', undefined, {
                bypassAuth: true
              })
              .success(function (response) {
                if (apiSession = response.data.session) {
                  mvdAccount.setSession(apiSession);
                  cb && cb();
                } else {
                  console.warn('No API key returned from server in response', response);
                }
              })
              .error(function (err) {
                console.warn('Server errored when requesting API key', err);
              });
          } else {
            var acctName = prompt("Please pick a username");
            if (!acctName) {
              return false;
            };
            $http.post(mvdApiUrl + '/_auth/new',
              {
                name: acctName
              },
              {
                bypassAuth: true
              })
              .success(function (response) {
                if (account = response.result) {
                  mvdAccount.setAccount(account);
                  cb && cb();
                } else {
                  console.warn('No account returned from server in response', response);
                }
              })
              .error(function (err) {
                console.warn('Server errored when requesting API key', err);
              });
          }
        } else if(cb) {
          $timeout(cb);
        }
      }
    }
  });