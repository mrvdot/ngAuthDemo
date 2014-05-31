'use strict';

angular
  .module('ngAuthDemo')
  .factory('mvdApi', function ($cookies, $cookieStore, $http) {
    var cookiePrefix = 'ngAuthDemo-'
      , baseUrl = 'http://ngAuth.mvd-apis.info'
      , _acct
      , _apiSession;

    return {
      init : function () {
        if (!(_apiSession = $cookies[cookiePrefix + 'apiSession'])) {
          if (_acct = $cookieStore.get(cookiePrefix + 'accountInfo')) {
            $http.post(baseUrl + '/_auth/authenticate', false, {
                headers : {
                  "x-ngauth-account": _acct.slug,
                  "x-ngauth-key": _acct.apikey
                }
              })
              .success(function (response) {
                if (_apiSession = response.data.session) {
                  $cookies[cookiePrefix + 'apiSession'] = _apiSession;
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
              $http.post(baseUrl + '/_auth/new', {
                  name: acctName
                })
                .success(function (response) {
                  if (_acct = response.result) {
                    $cookieStore.put(cookiePrefix + 'accountInfo', _acct);
                  } else {
                    console.warn('No account returned from server in response', response);
                  }
                })
                .error(function (err) {
                  console.warn('Server errored when requesting API key', err);
                });
            }
        };
      }
    }
  });