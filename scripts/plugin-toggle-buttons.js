/**
 * Including this module makes radio buttons in wrapped with [data-toggle=buttons]
 * look right. Puts the "active" class on the active button so bootstrap con style it.
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

  Y.all('[data-toggle=buttons]').plug(Y.BMP.Plugins.ToggleButtons);

}, '1.0', {
  requires:[
    'base',
    'event',
    'plugin'
  ]
});