/**
 * The module containing the BasicModel
 * @module bmp-model-basic
 */
YUI.add('bmp-model-basic', function(Y) {
  var BasicModel =
  /**
   * Basic filtered model for charts where you can groupby or filterby things.
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

    removeFilter: function(column) {
      delete this._filters[column];
    },

    setPartition: function(column, values, operator) {
      this._setFilterOrPartition(this._partitions, column, values, operator);
    },

    clearPartition: function() {
      this._partitions = {};
    },

    _setFilterOrPartition: function(filtersHash, column, values, operator) {

      if (!Y.Lang.isValue(values)) {
        this.removeFilter(column);
        return;
      }

      if (!Y.Lang.isValue(operator)) {
        operator = 'in';
      }

      if (
        operator === 'in' &&
        Y.Lang.isValue(values) &&
        !Y.Lang.isArray(values)) {

        values = [values];
      }

      var value;

      filtersHash[column] = {
        operator: operator,
        values: values
      };
    },

    _getQueryParams: function() {
      params = {
        groupby : this.get('groupby').join(','),
        use_descriptions: this.get('useDescriptions'),
        sort: this.get('sort')
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
        var valuesStr = String(Y.Lang.isArray(filter_params.values) ? filter_params.values.join(',') : filter_params.values);
        params[prefix + '_' + filter_params.operator + '_' + column.toLowerCase()] = valuesStr;
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
          rawResponse: response,
          populationSize: response.populationSize,
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
      var threshold = 2000;


      var populationLargeEnough = true;

      if (Y.Lang.isNumber(this.get('populationSize'))) {
        populationLargeEnough = this.get('populationSize') >= threshold;
      }

      if (Y.Lang.isArray(this.get('populationSize'))) {
        // TODO I'm sure a statistician would laugh - let's update this
        populationLargeEnough = Y.Array.find(this.get('populationSize'), function(n) {
          return n < threshold;
        }) === null;

      }

      if (!populationLargeEnough) {
        errors.push('Not enough data');
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

      useDescriptions: {
        value: true,
        validator: Y.Lang.isBoolean
      },

      sort: {
        value: false,
        validator: Y.Lang.isBoolean
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
      },

      rawResponse: {
        value: null
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