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
      if (!Y.Lang.isArray(config.options.colors)) {
        config.options.colors = ['#2C486E', '#211B11', '#6E5321', '#2E1D1C',
         '#3C4754', '#111821', '#262254'];
      }
      this._wrapper = new google.visualization.ChartWrapper(config);
      google.visualization.events.addListener(this._wrapper, 'ready', Y.bind(this._bindChartEvents, this));
      this.publish('select');
    },

    renderUI: function() {
      var cb = this.get('contentBox');
      cb.append(Y.Node.create('<div class="inner-chart-wrapper"></div>'));
    },

    syncUI: function() {
      GChart.superclass.syncUI.apply(this, arguments);
      
      this._drawChart();
    },

    setData: function(data) {
      this.set('dataTable', data);
    },

    _drawChart: function() {
      var cb = this.get('contentBox');

      var chartWrapper = cb.one('.inner-chart-wrapper');
      this._wrapper.draw(chartWrapper.getDOMNode());
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

      // Y.on('windowresize', function(e) {
      //   this.syncUI();
      // }, this);
      window.onresize = Y.throttle(Y.bind(this.syncUI, this), 500);
    },

    _bindChartEvents: function() {
      google.visualization.events.addListener(this._wrapper.getChart(), 'select', Y.bind(function() {
        this.fire('select', this._wrapper.getChart().getSelection());
      }, this));
    }
    

  }, {
    CSS_PREFIX: 'bmp-gchart',

    ATTRS:{
      chartType: {
        required: true,
        validator: Y.Lang.isString
      },

      dataTable: {
        required: true
        // validator: Y.Lang.isArray
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
    'base',
    'yui-throttle'
  ]
});