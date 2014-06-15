/**
 * The module containing the ButtonController
 * @module bmp-button-controller
 */
YUI.add('bmp-button-controller', function(Y) {
  var ButtonController =
  /**
   * 
   * @class ButtonController
   * @namespace BMP
   * @extends Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP').ButtonController =
  Y.Base.create('ButtonController', Y.Base, [], {

    initializer: function(config) {
      var buttonContainer = config.buttonContainer;
      buttonContainer.delegate('change', this._onChange, '.filter input', this);
    },

    _onChange: function(e) {
      var group = e.target.ancestor('.filter');
      var variable = group.getAttribute('data-filter-var');

      if (!Y.Lang.isValue(variable)) {
        return;
      }

      var values = [];
      group.all('input:checked').each(function(button) {
        var value = button.get('value');
        if (Y.Lang.isValue(value) && value != -1) {
          values.push(value);
        }
      });

      this.get('dataSource').setFilter(variable, values);
      this.get('dataSource').load();
    }

  }, {

    ATTRS:{
      buttonContainer: {
        required: true,
        validator: function(val) {
          return val instanceof Y.Node;
        }
      },
      dataSource: {
        required: true,
        validator: function(val) {
          return val instanceof Y.BMP.Models.BasicModel;
        }
      }
    }
  });
}, '1.0', {
  requires:[
    'base'
  ]
});