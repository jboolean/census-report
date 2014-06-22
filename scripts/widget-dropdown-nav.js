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

      var activeTitle = Y.Object.getValue(activeItem, ['title']) || 'Menu';

      node.one('.active-text').set('text', activeTitle);
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
        this.toggleOpen();
        e.halt(true);
        this._bodyListener = Y.one('body').on('tap', function(e) {
          if (!e.target.ancestor('.dropdown', true)) {
            this.toggleOpen(false);
          }
        }, null, this);
      }, null, this);
    },

    toggleOpen: function(force) {
      var dropdown = this.get('contentBox').one('.dropdown');
      dropdown.toggleClass('open', force);
      var isOpen = dropdown.hasClass('open');
      if (!isOpen && this._bodyListener) {
        this._bodyListener.detach();
      }
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
          {url: '/poverty', title: 'Poverty Rates'},
          {url: '/rentburden', title: 'Rent Burden'},
          {url: '/schooltowork', title: 'Art School & Occupation'},
          {url: '/selfreport', title: 'You'}
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
    'base',
    'event',
    'widget-base'
  ]
});