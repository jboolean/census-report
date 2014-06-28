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
      return this._getReportNode(report);
    },

    _getReportNode: function(report) {
      if (report.version && report.version != 1) {
        throw 'unsupported report version';
      }

      var out = '';

      if (Y.Lang.isString(report.name)) {
        out += subAndEscape('My name is {name}, and ', report);
      }

      out += 'I made ' + Y.Escape.html(report.project_description);
      
      if (Y.Lang.isValue(report.space_price_amount) || Y.Lang.isValue(report.space_type)) {
        out += subAndEscape(' while renting a {space_type}', {
          space_type: report.space_type || 'space'
        });
      }

      if (Y.Lang.isValue(report.space_price_amount)) {
        out += ' for';
        if (report.space_price_amount === '$0.00') {
          out += ' free';
        } else {
          out += ' ' + Y.Escape.html(report.space_price_amount);

          if (Y.Lang.isValue(report.space_price_unit)) {
            out += ' per ' + Y.Escape.html(report.space_price_unit);
          }
        }
      } //end space price

      if (Y.Lang.isValue(report.project_year)) {
        out += subAndEscape(' in {project_year}', report);
      }

      out += '.';

      if (Y.Lang.isValue(report.project_url)) {
        out += ' Find out more about it at ' +
          Y.Lang.sub('<a href="{project_url}" target="_blank" ' +
            'class="external">{project_url_domain} ' +
            '</a>.', {
            project_url: report.project_url.replace('"', '&quot;'),
            project_url_domain: Y.Escape.html(report.project_url_domain)
          });
      }

      var li = Y.Node.create('<li>');
      li.setHTML(out);
      li.setAttribute('data-id', report.id);
      return li;
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
    'escape'
  ]
});