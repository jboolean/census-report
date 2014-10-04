/**
 * The module containing the DataSourcedChart
 * @module bmp-widget-datasourced-chart
 */
YUI.add('bmp-widget-datasourced-chart', function(Y) {
  var DataSourcedChart =
  /**
   * 
   * @class DataSourcedChart
   * @namespace BMP.Widget
   * @extends BMP.Widget.GChart
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').DataSourcedChart =
  Y.Base.create('DataSourcedChart', Y.Widget, [], {

    initializer: function() {
      this.syncUIDebounced = Y.BMP.Util.Debounce(this.syncUI, 100, this);
    },

    renderUI: function() {
      var cb = this.get('contentBox');
      var chartContainer = Y.Node.create('<div class="ds-chart-wrapper"></div>');
      cb.append(chartContainer);

      this.get('chart').render(chartContainer);
    },

    bindUI: function() {
      DataSourcedChart.superclass.bindUI.apply(this, arguments);
      
      var dataSource = this.get('dataSource');
      dataSource.after('loaded', function() {
        this.get('chart').setData(dataSource.get('data'));
      }, this);
      
      dataSource.after('dataStateChange', function() {
        this.syncUIDebounced();
      }, this);

    },

    syncUI: function() {
      DataSourcedChart.superclass.syncUI.apply(this, arguments);

      var cb = this.get('contentBox');

      var dataSource = this.get('dataSource');

      cb.all('.error, .alert').remove(true);

      var dataState = dataSource.get('dataState');

      if (dataState === 'initial') {
        return;
      } else if (dataState === 'loading') {
        cb.one('.ds-chart-wrapper').hide();
        cb.append(Y.Node.create('<div class="alert alert-info">Calculating</div>'));
      } else {

        // don't display if there are fatal errors
        var hasFatalErrors = false;

        var errors = dataSource.get('errors');
        Y.Array.each(errors, function(errorText) {
          var errorNode = Y.Node.create('<div class="error alert alert-warning"></div>');
          errorNode.set('text', errorText);
          cb.append(errorNode);
          hasFatalErrors = true;
        });

        var chartWrapper = cb.one('.ds-chart-wrapper');
        chartWrapper.toggleView(!hasFatalErrors);
        
      }
    },

    _drawChart: function() {
      throw 'not implmented';
    }

  }, {

    ATTRS:{

      dataSource: {
        writeOnce: 'initOnly',
        validator: function(val) {
          return val instanceof Y.BMP.Model.BasicModel;
        }
      },

      chart: {
        required: true,
        validator: function(val) {
          return Y.Lang.isFunction(val.setData);
        }
      }

    }
  });
}, '1.0', {
  requires:[
    'base',
    'widget',
    'bmp-debounce'
  ]
});