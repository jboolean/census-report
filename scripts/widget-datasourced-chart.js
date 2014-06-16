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
  Y.Base.create('DataSourcedChart', Y.BMP.Widget.GChart, [], {

    bindUI: function() {
      DataSourcedChart.superclass.bindUI.apply(this, arguments);
      
      var dataSource = this.get('dataSource');
      if (Y.Lang.isValue(dataSource)) {
        dataSource.on('loaded', function() {
          this.set('dataTable', dataSource.get('data'));
        }, this);
      }
    },

    syncUI: function() {
      DataSourcedChart.superclass.syncUI.apply(this, arguments);

      var cb = this.get('contentBox');

      var dataSource = this.get('dataSource');

      if (!dataSource.get('loaded')) {
        return;
      }

      cb.all('.error').remove(true);

      // don't display if there are fatal errors
      var hasFatalErrors = false;

      var errors = dataSource.getErrors();
      Y.Array.each(errors, function(errorText) {
        var errorNode = Y.Node.create('<div class="error alert alert-warning"></div>');
        errorNode.set('text', errorText);
        cb.append(errorNode);
        hasFatalErrors = true;
      });

      var chartWrapper = cb.one('.inner-chart-wrapper');

      chartWrapper.toggleView(!hasFatalErrors);
    }

  }, {

    ATTRS:{

      dataSource: {
        writeOnce: 'initOnly',
        validator: function(val) {
          return val instanceof Y.BMP.Model.BasicModel;
        }
      }

    }
  });
}, '1.0', {
  requires:[
    'bmp-widget-gchart',
    'base'
  ]
});   