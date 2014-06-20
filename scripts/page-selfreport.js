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

      Y.all('.selfreport button.submit').after('tap', this.submitForm, null, this);
    },
    
    submitForm: function(e) {
      var form = e.target.ancestor('form');
      e.target.addClass('disabled');
      var data = {};
      form.all('input, select').each(function(node) {
        var value = node.get('value');
        if (!isNullOrEmpty(value)) {
          data[node.get('name')] = node.get('value');
        }
      });

      if (!isNullOrEmpty(data.space_size_unitless) && !isNullOrEmpty(data.space_size_units)) {
        if (data.space_size_units === 'm') {
          data.space_size_ft = metersToFeet(data.space_size_unitless);
        } else if (data.space_size_units === 'ft') {
          data.space_size_ft = data.space_size_unitless;
        } else {
          throw 'bad units';
        }
      }

      Y.Data.post({
        url: '/api/selfreport/v1',
        data: data
      })
      .then(function() {
        //success
        Y.all('.selfreport .error').removeClass('error');
        Y.one('.selfreport form').getDOMNode().reset();
        e.target.removeClass('disabled');
      }, function(response) {
        //failure
        if (Y.Lang.isObject(response.fields)) {
          Y.Object.each(response.fields, function(message, field) {
            Y.all('.selfreport input[name=' + field + ']').addClass('error');
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
  };
}, '1.0', {
  requires:[
    'node-event-delegate',
    'node',
    'event-tap',
    'jsb-data-util'
  ]
});