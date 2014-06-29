YUI.add('bmp-widget-selfreport-list', function(Y) {

  var subAndEscape = function() {
    return Y.Escape.html(Y.Lang.sub.apply(this, arguments));
  };

  var SelfReportList =
  Y.namespace('BMP.Widget').SelfReportList =
  Y.Base.create('SelfReportListWidget', Y.Widget, [], {
    TEMPLATE: '<ul class="report-list new-reports"></ul>' +
              '<ul class="report-list old-reports"></ul>',
    renderUI: function() {
      SelfReportList.superclass.renderUI.apply(this, arguments);
      this.get('contentBox').append(this.TEMPLATE);
    },

    syncUI: function() {
      SelfReportList.superclass.syncUI.apply(this, arguments);
      
      var contentBox = this.get('contentBox');

      var originalReportsNode = contentBox.one('.old-reports').empty();
      Y.Array.each(this.get('originalReports'), function(report) {
        originalReportsNode.append(this._renderReport(report));
      }, this);
    },

    addReport: function(report) {
      var newReportsNode = this.get('contentBox').one('.new-reports');
      newReportsNode.prepend(this._renderReport(report));
    },

    setOriginalReportList: function(reports) {
      this._set('originalReports', reports);
      this.syncUI();
    },

    _renderReport: function(report) {
      return Y.BMP.SelfReportTextGenerators.getListNode(report);
    }
    

  }, {

    CSS_PREFIX: 'bmp-selfreport-list',


    ATTRS:{
      originalReports: {
        required: true,
        value: []
      },

      newReports: {
        value: []
      }
    }
  });
}, '1.0', {
  requires:[
    'widget',
    'node',
    'base',
    'bmp-selfreport-text-generators'
  ]
});