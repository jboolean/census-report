/**
 * The module containing the ToggleButtons
 * @module bmp-plugins-toggle-buttons
 */
YUI.add('bmp-plugins-toggle-buttons', function(Y) {
  var ToggleButtons =
  /**
   * Turn a button group into a toggling button group without jQuery and bootstrap's crap.
   * @class ToggleButtons
   * @namespace Plugins
   * @extends Plugin.Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Plugins').ToggleButtons =
  Y.Base.create('ToggleButtons', Y.Plugin.Base, [], {
    initializer: function() {
      var host = this.get('host');
      host.delegate('tap', this._toggle, '.btn', this);
    },

    _toggle: function(e) {
      var button = e.target.ancestor('.btn', true);
      if (!this.get('multi')) {
        button.siblings('.btn.active').removeClass('active');
      }
      button.addClass('active');
    }
    

  }, {
    NS: 'plugin-toggle-buttons',

    ATTRS:{
      multi: {
        value: false,
        validator: Y.Lang.isBoolean
      }
    }
  });
}, '1.0', {
  requires:[
    'plugin',
    'base'
  ]
});