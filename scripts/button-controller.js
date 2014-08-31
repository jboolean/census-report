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
      buttonContainer.delegate('change', this._onChange, '[data-facet-name]', this);
      buttonContainer.all('[data-facet-name]').each(this._updateFacets, this);
      if (config.load) {
        this.get('dataSource').load();
      }
    },

    _onChange: function(e) {
      this._updateFacets(e.target);
      this.get('dataSource').load();
    },

    _updateFacets: function(node) {
      var group = node.ancestor('[data-facet-name]', true);
      var variable = group.getAttribute('data-facet-name');

      if (!Y.Lang.isValue(variable)) {
        return;
      }

      var values = [];
      group.all('input:checked').each(function(button) {

        var value = button.get('value');
        if (Y.Lang.isValue(value) && value != -1) {
          values = value.split(',');
        }
      });

      if (values.length === 0) {
        values = null;
      }

      this.get('dataSource').setFacet(variable, values);
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