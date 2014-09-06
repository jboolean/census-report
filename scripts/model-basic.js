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
      this._partitionfacets = {};
      this._facets = {};
    },

    /** @deprecated **/
    setFilter: function(column, values, operator) {
      this._setFilterOrPartition(this._filters, column, values, operator);
    },


    removeFilter: function(column) {
      delete this._filters[column];
    },

    setFacet: function(facet, selections) {
      if (!Y.Lang.isValue(selections)) {
        this.removeFacet(facet);
        return;
      }
      
      this._setFacet(this._facets, facet, selections);
    },

    removeFacet: function(facet) {
      delete this._facets[facet];
    },

    setPartitionFacet: function(facet, selections) {
      this._setFacet(this._partitionfacets, facet, selections);
    },

    setPartition: function(column, values, operator) {
      this._setFilterOrPartition(this._partitions, column, values, operator);
    },

    clearPartition: function() {
      this._partitions = {};
      this._partitionfacets = {};
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

    _setFacet: function(facetsHash, facet, selections) {
      if (!Y.Lang.isArray(selections)) {
        selections = [selections];
      }

      facetsHash[facet] = selections;
    },

    _getQueryParams: function() {
      return Y.merge({
        groupby : this.get('groupby').join(','),
        use_descriptions: this.get('useDescriptions'),
        sort: this.get('sort')
      },
      this._createFilterQueryParams(this._filters),
      this._createFilterQueryParams(this._partitions, 'partition'),
      this._createFacetQueryParams(this._facets),
      this._createFacetQueryParams(this._partitionfacets, 'partitionfacet'));
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

    _createFacetQueryParams: function(facets, prefix) {
      var params = {};
      if (!prefix) {
        prefix = 'facet';
      }

      Y.Object.each(facets, function(selections, facet) {
        params[prefix + '_' + facet] = selections.join(',');
      });

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