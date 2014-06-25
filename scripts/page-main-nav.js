/**
 * The module containing the MainNav
 * @module bmp-page-main-nav
 */
YUI.add('bmp-page-main-nav', function(Y) {
  var MainNav =
  Y.namespace('BMP.Page').MainNav = {
    initializePage: function() {
      this._dropdownNav = new Y.BMP.Widget.DropdownNav();
      this._dropdownNav.render(Y.one('nav .dropdown-wrapper'));
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-dropdown-nav',
    'base'
  ]
});