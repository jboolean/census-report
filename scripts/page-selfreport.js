/**
 * The module to initialize the selfreport page
 * @module bmp-page-selfreport
 */
YUI.add('bmp-page-selfreport', function(Y) {

  var isNullOrEmpty = function(str) {
    return !Y.Lang.isValue(str) || str === '';
  };

  var metersToFeet = function(meters) {
    if (Y.Lang.isString(meters)) {
      meters = parseFloat(meters);
    }
    return meters * 3.28084;
  };


  Y.namespace('BMP.Page').SelfReport = {
    initializePage: function() {
      Y.all('.selfreport input[name=space_size_x], .selfreport input[name=space_size_y]')
        .on('keyup', this.updateSquaredArea);

      Y.all('.selfreport textarea[name=comment]')
        .on('keydown', this._onCommentChange);

      Y.all('.selfreport button.submit').after('tap', this.submitForm, null, this);

      var reportListWidget = this._reportListWidget = new Y.BMP.Widget.SelfReportList();

      reportListWidget.render(Y.one('.reports'));

      this._loadSelfReportList()
      .then(function(response) {
        reportListWidget.setOriginalReportList(response.results);
      }, function(err) {
        console.log(err);
      });

    },
    
    submitForm: function(e) {
      e.halt();
      var form = e.target.ancestor('form');
      var endpoint = form.getAttribute('target');
      e.target.addClass('disabled');
      var data = {};
      form.all('input, select, textarea').each(function(node) {
        var value = node.get('value');
        if (!isNullOrEmpty(value)) {
          var value = node.get('value');
          if (value.indexOf('$') === 0) {
            value = value.trim().substr(1);
          }
          data[node.get('name')] = value;
        }
      });

      // TODO: 2 is number of selects
      if (Y.Object.size(data) <= form.all('select').size() - 1) {
        e.target.removeClass('disabled');
        e.halt();
        return;
      }

      if (!isNullOrEmpty(data.space_size_unitless) && !isNullOrEmpty(data.space_size_units)) {
        if (data.space_size_units === 'm') {
          data.space_size_ft = metersToFeet(data.space_size_unitless);
        } else if (data.space_size_units === 'ft') {
          data.space_size_ft = data.space_size_unitless;
        } else {
          throw 'bad units';
        }
      }

      if (Y.Lang.isString(data.space_price_amount)) {
        if (data.space_price_amount.trim().indexOf('$') === 0) {
          data.space_price_amount = data.space_price_amount.trim().substr(1);
        }
      }

      Y.Data.post({
        url: endpoint,
        data: data
      }, this)
      .then(Y.bind(function(response) {
        var report = response.results[0];
        //success
        form.all('.selfreport .error').removeClass('error');
        form.getDOMNode().reset();
        e.target.removeClass('disabled');

        this._reportListWidget.addReport(report);

      }, this), function(response) {
        //failure
        if (Y.Lang.isObject(response.fields)) {
          Y.Object.each(response.fields, function(message, field) {
            form.all('input[name=' + field + ']').addClass('error');
          });
        } else {
          alert('Something went wrong. We\'ll give it a look.');
        }
        e.target.removeClass('disabled');
      });
    },

    updateSquaredArea: function() {
      var squaredNode = Y.one('.selfreport input[name=space_size_unitless]');
      var xNode = Y.one('.selfreport input[name=space_size_x]');
      var yNode = Y.one('.selfreport input[name=space_size_y]');
      var x = xNode.get('value');
      var y = yNode.get('value');
      if (x && y) {
        squaredNode.set('value', x * y);
      }
    },

    _loadSelfReportList: function() {
      return Y.Data.get({
        url: '/api/selfreport'
      });
    },

    _onCommentChange: function(e) {
      if (e.keyCode === 8 || e.metaKey) {
        return;
      }
      var textbox = e.target;
      var text = textbox.get('value');
      if (!text) {
        return;
      }
      var words = text.match(/(\S*)\s+/g);
      if (Y.Lang.isArray(words) && words.length > 20) {
        e.halt(true);
      }
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-selfreport-list',
    'event-tap',
    'jsb-data-util',
    'node',
    'node-event-delegate'
  ]
});