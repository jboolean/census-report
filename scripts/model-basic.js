/**
 * The module containing the BasicModel
 * @module bmp-model-basic
 */
YUI.add('bmp-model-basic', function(Y) {
  var BasicModel =
  /**
   * Basic filtered model for charts whereby you can groupby or filterby things.
   * @class BasicModel
   * @namespace BMP.Model
   * @extends Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Model').BasicModel =
  Y.Base.create('BasicModel', Y.Base, [], {

    initializer: function() {
      this.publish('loaded');
      this.publish('load-failed');
      this._filters = {};
      this._partitions = {};
    },


    setFilter: function(column, values, operator) {
      this._setFilterOrPartition(this._filters, column, values, operator);
    },

    setPartition: function(column, values, operator) {
      this._setFilterOrPartition(this._partitions, column, values, operator);
    },

    clearPartition: function() {
      this._partitions = {};
    },

    _setFilterOrPartition: function(filtersHash, column, values, operator) {
      if (Y.Lang.isValue(values) && !Y.Lang.isArray(values)) {
        values = [values];
      }

      if (!Y.Lang.isArray(values) || values.length === 0) {
        this.removeFilter(column);
        return;
      }

      if (!Y.Lang.isValue(operator)) {
        operator = 'in';
      }

      filtersHash[column] = {
        operator: operator,
        values: values
      };
    },

    removeFilter: function(column) {
      delete this._filters[column];
    },

    _getQueryParams: function() {
      params = {
        groupby : this.get('groupby').join(','),
        use_descriptions: true
      };

      params = Y.merge(params, this._createFilterQueryParams(this._filters));
      params = Y.merge(params, this._createFilterQueryParams(this._partitions, 'partition'));

      return params;
    },

    _createFilterQueryParams: function(filters, prefix) {
      var params = {};
      if (!prefix) {
        prefix = 'filter';
      }

      Y.Object.each(filters, function(filter_params, column) {
        params[prefix + '_' + filter_params.operator + '_' + column.toLowerCase()] = filter_params.values.join(',');
      }, this);

      return params;
    },

    load: function() {
      this.set('dataState', 'loading');
      return this._loadCached(this.get('endpoint'), this._getQueryParams())
      .then(Y.bind(function(response) {
        var data = response.results;
        // data.splice(0,0,response.fields);
        if (Y.Lang.isFunction(this.get('dataPreparer'))) {
          data = this.get('dataPreparer')(response);
        }

        this.setAttrs({
          data: data,
          populationSize: response.populationSize,
          dataState: 'loaded',
          errors: []
        });
        this.updateErrors();
        this.set('dataState', 'loaded');
        this.fire('loaded');
        return response;
      }, this), Y.bind(function(response) {
        console.error('Data load error');
        this.set('errors', 'Data could not be loaded.');
        this.set('dataState', 'load-failed');
        this.fire('load-failed');
      },this));
    },

    _loadCached: function(endpoint, queryParams) {
      var cacheKey = endpoint + '__' + Y.QueryString.stringify(queryParams);
      if (Y.Object.hasKey(BasicModel._cache, cacheKey)) {
        return Y.when(Y.clone(BasicModel._cache[cacheKey]));
      } else {

        return Y.Data.get({
          url: endpoint,
          data: queryParams
        }, this)

        .then(Y.bind(function(result) {
          BasicModel._cache[cacheKey] = result;
          return Y.clone(result);
        }, this));

      }
    },

    updateErrors: function() {
      var errors = this.get('errors');

      if (Y.Lang.isArray(this.get('populationSize'))) {
        // TODO I'm sure a statistician would laugh - let's update this
        var threshold = 1000;
        var populationLargeEnough = Y.Array.find(this.get('populationSize'), function(n) {
          return n < threshold;
        }) === null;

        if (!populationLargeEnough) {
          errors.push('Not enough data');
        }
      }

      this.set('errors', errors);
    }

  }, {

    //TODO: this cache is currently boundless
    _cache: {},

    ATTRS:{

      groupby: {
        value: [],
        setter: function(val) {
          return Y.Lang.isArray(val) ? val : [val];
        }
      },

      dataPreparer: {
        //function
      },

      data: {
        value: null
      },

      populationSize: {

      },

      endpoint: {
        value: '/api/acs'
      },

      dataState: {
        value: 'initial'
        //todo make an enum
      },

      errors: {
        value: []
      }

      
    }
  });
}, '1.0', {
  requires:[
    'array-extras',
    'base',
    'jsb-data-util',
    'promise',
    'querystring-stringify'
  ]
});