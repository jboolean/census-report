/**
 * The module containing the one, the only, dropdownnav
 * @module bmp-widget-dropdown-nav
 */
YUI.add('bmp-widget-dropdown-nav', function(Y) {

  var DropdownNav =
  /**
   * 
   * @class DropdownNav
   * @namespace BMP.Widget
   * @extends Widget
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').DropdownNav =
  Y.Base.create('DropdownNav', Y.Widget, [], {

    renderUI: function() {
      var activePath = this.get('activePath');
      var activeItem = Y.Array.find(this.get('items'), function(item) {
        return activePath.indexOf(item.url) === 0;
      });

      var cb = this.get('contentBox');
      var node = Y.Node.create(DropdownNav.TEMPLATE);

      node.one('.active-text').set('text', activeItem.title);
      var ul = node.one('ul');

      Y.Array.each(this.get('items'), function(item) {
        var html = Y.Lang.sub('<li><a href="{url}">{title}</a></li>', item);
        var node = Y.Node.create(html);
        if (item === activeItem) {
          node.addClass('active');
        }
        ul.append(node);
      });

      cb.empty().append(node);
    },

    bindUI: function() {
      this.get('contentBox').all('.dropdown-toggle').on('tap', function(e) {
        e.target.ancestor('.dropdown', true).toggleClass('open');
        e.halt(true);
      });
    }
    

  }, {

    TEMPLATE: 'Explore <div class="dropdown">' +
                  '<a class="dropdown-toggle"><span class="active-text">Dropdown text</span>' +
                  '<span class="caret"></span></a>' +
                  '<ul>' +
                  '</ul>' +
                '</div>',
    CSS_PREFIX: 'bmp-dropdown-nav',

    ATTRS:{
      items: {
        value: [
          {url: '/rentburden', title: 'Rent Burden'},
          {url: '/schooltowork', title: 'Art School & Occupation'}
        ]
      },

      activePath: {
        valueFn: function() {
          return window.location.pathname;
        }
      }
    }
  });
}, '1.0', {
  requires:[
    'widget-base',
    'base'
  ]
});