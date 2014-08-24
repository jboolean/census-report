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
      buttonContainer.delegate('change', this._onChange, '[data-filter-var]', this);
      buttonContainer.all('[data-filter-var]').each(this._updateFilter, this);
      if (config.load) {
        this.get('dataSource').load();
      }
    },

    _onChange: function(e) {
      this._updateFilter(e.target);
      this.get('dataSource').load();
    },

    _updateFilter: function(node) {
      var group = node.ancestor('.filter', true);
      var variable = group.getAttribute('data-filter-var');

      if (!Y.Lang.isValue(variable)) {
        return;
      }

      var values = [];
      group.all('input:checked').each(function(button) {

        var value = button.get('value');
        if (Y.Lang.isValue(value) && value != -1) {

          Y.Array.each(value.split(','), function(singleValue) {
            values.push(singleValue);
          });

        }
      });

      if (values.length === 0) {
        values = null;
      }

      this.get('dataSource').setFilter(variable, values);
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
          return val instanceof Y.BMP.Model.BasicModel;
        }
      },

      // load on initialize
      load: {
        validator: Y.Lang.isBoolean,
        value: false
      }
    }
  });
}, '1.0', {
  requires:[
    'base'
  ]
});