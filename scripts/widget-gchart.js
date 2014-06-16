/**
 * The module containing the GChart
 * @module bfamfaphd-gchart
 */
YUI.add('bmp-widget-gchart', function(Y) {
  var GChart =
  /**
   * A YUI Widget wrapper around Google Charts with some enhancements.
   * Note! Must create somewhere in `google.setOnLoadCallback`
   * @class GChart
   * @namespace namespace
   * @extends Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').GChart =
  Y.Base.create('GChart', Y.Widget, [], {
    initializer: function(config) {
      this._wrapper = new google.visualization.ChartWrapper(config);
    },

    renderUI: function() {
      var cb = this.get('contentBox');
      cb.append(Y.Node.create('<div class="inner-chart-wrapper"></div>'));
    },

    syncUI: function() {
      GChart.superclass.syncUI.apply(this, arguments);
      
      var cb = this.get('contentBox');

      var dataSource = this.get('dataSource');

      cb.all('.error').remove(true);

      var hasErrors = false;

      if (Y.Lang.isValue(dataSource)) {

        if (!dataSource.get('loaded')) {
          return;
        }

        var errors = dataSource.getErrors();
        Y.Array.each(errors, function(errorText) {
          var errorNode = Y.Node.create('<div class="error alert alert-warning"></div>');
          errorNode.set('text', errorText);
          cb.append(errorNode);
          hasErrors = true;
        });
      }

      var chartWrapper = cb.one('.inner-chart-wrapper');

      if (!hasErrors) {
        this._wrapper.draw(chartWrapper.getDOMNode());
        chartWrapper.show();
      } else {
        chartWrapper.hide();
      }

    },

    bindUI: function() {
      this.on('optionsChange', function(e) {
        this._wrapper.setOptions(e.newVal);
        this.syncUI();
      }, this);

      this.on('dataTableChange', function(e) {
        this._wrapper.setDataTable(e.newVal);
        this.syncUI();
      }, this);

      this.on('chartTypeChange', function(e) {
        this._wrapper.setChartType(e.newVal);
        this.syncUI();
      }, this);

      Y.on('windowresize', function(e) {
        this.syncUI();
      }, this);

      var dataSource = this.get('dataSource');
      if (Y.Lang.isValue(dataSource)) {
        dataSource.on('loaded', function() {
          this.set('dataTable', dataSource.get('data'));
        }, this);
      }


    }
    

  }, {

    ATTRS:{
      chartType: {
        required: true,
        validator: Y.Lang.isString
      },

      dataTable: {
        required: true,
        validator: Y.Lang.isArray
      },

      dataSource: {
        writeOnce: 'initOnly'
      },

      options: {
        validator: Y.Lang.isObject,
        value: {}
      }
    }
  });
}, '1.0', {
  requires:[
    'widget-base',
    'event-resize',
    'event',
    'base'
  ]
});