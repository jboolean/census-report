/**
 * The module containing the BasicModel
 * @module bmp-models-basic
 */
YUI.add('bmp-models-basic', function(Y) {
  var BasicModel =
  /**
   * Basic filtered model for charts whereby you can groupby or filterby things.
   * @class BasicModel
   * @namespace BMP.Models
   * @extends Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Models').BasicModel =
  Y.Base.create('BasicModel', Y.Base, [], {

    initializer: function() {
      this.publish('loaded');
      this.publish('load-failed');
      this._filters = {};
    },

    setFilter: function(column, values, operator) {
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

      this._filters[column] = {
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

      Y.Object.each(this._filters, function(filter_params, column) {
        params['filter_' + filter_params.operator + '_' + column.toLowerCase()] = filter_params.values.join(',');
      }, this);

      return params;
    },

    load: function() {
      return Y.Data.get({

        url: this.get('endpoint'),
        data: this._getQueryParams()

      }, this)
      .then(Y.bind(function(response) {
        var data = response.results;
        // data.splice(0,0,response.fields);
        if (Y.Lang.isValue(this.get('dataPreparer'))) {
          data = this.get('dataPreparer')(response);
        }

        this.setAttrs({
          data: data,
          populationSize: response.populationSize,
          loaded: true
        });
        this.fire('loaded');
        return response;
      }, this), Y.bind(function(response) {
        console.error('Data load error');
        this.fire('load-failed');
      },this));
    },

    getErrors: function() {
      // I'm a statistician would laugh - let's update this
      var errors = [];

      var threshold = 1000;
      var populationLargeEnough =Y.Array.find(this.get('populationSize'), function(n) {
        return n < threshold;
      }) === null;

      if (!populationLargeEnough) {
        errors.push('Not enough data');
      }
      return errors;
    }

  }, {

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

      loaded: {
        value: false
      }

      
    }
  });
}, '1.0', {
  requires:[
    'querystring-stringify',
    'base',
    'jsb-data-util',
    'array-extras'
  ]
});