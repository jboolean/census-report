YUI().add('jsb-data-util', function(Y) {

  var handleComplete = function(callback) {
    return function(io, a, args) {
      if (!Y.Lang.isFunction(callback)) {
        return null;
      }
      var response = Y.JSON.parse(a.responseText);
      Y.bind(callback, this)(response);
    };
  };

  Y.Data = {
    _go: function(method, config, context) {
      var contentType = 'application/json';

      if (method === 'POST') {
        contentType = 'application/x-www-form-urlencoded';
      }

      return new Y.Promise(function(resolve, reject) {
        Y.io(config.url, {
          method: method,
          headers: {
            'Content-Type': contentType
          },
          data: Y.QueryString.stringify(config.data),
          on: {
            success: handleComplete(resolve),
            failure: handleComplete(reject)
          },
          context: context
        });
      });
    },

    get: function(config, context) {
      return this._go('GET', config, context);
    },

    put: function(config, context) {
      return this._go('PUT', config, context);
    },

    post: function(config, context) {
      return this._go('POST', config, context);
    }
  };

}, '1.0', {
  requires: ['io-base', 'json-parse', 'node', 'querystring-parse', 'promise']
});