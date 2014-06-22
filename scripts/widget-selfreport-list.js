YUI.add('bmp-widget-selfreport-list', function(Y) {

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
      var node = Y.Node.create('<li>');
      node.setHTML(this._reportToString(report));
      return node;
    },

    _reportToString: function(report) {
      if (report.version && report.version != 1) {
        throw 'unsupported report version';
      }

      var out = 'I made ' + report.project_description;
      if (Y.Lang.isString(report.space_type)) {
        out += ' while renting a ' + report.space_type;
      }

      if (Y.Lang.isValue(report.space_price_amount)) {
        out += ' for';
        if (report.space_price_amount === '$0.00') {
          out += ' free';
        } else {
          out += ' ' + report.space_price_amount;

          if (Y.Lang.isValue(report.space_price_unit)) {
            out += ' per ' + report.space_price_unit;
          }
        }
      } //end space price

      if (Y.Lang.isValue(report.project_year)) {
        out += ' in ' + report.project_year;
      }

      out += '.';

      if (Y.Lang.isValue(report.space_size_ft)) {
        out += ' The space is about ' + report.space_size_ft + 'ft&#x00B2;.';
      }

      return out;
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
    'base'
  ]
});