/**
 * The module to initialize the poverty page
 * @module bmp-page-poverty
 */
YUI.add('bmp-page-poverty', function(Y) {
  Y.namespace('BMP.Page').Poverty = {

    initializePage: function() {
      // this.renderNav();
      
      var setArtistFilter = function(partitionType, dataModel) {
        dataModel.removeFilter('occ_artist_class');
        dataModel.removeFilter('fod1p_artist');
        switch (partitionType) {
        case 'occ_artist_class':
          dataModel.clearPartition();
          dataModel.setFilter('occ_artist_class', [1]);
          break;
        case 'artist_degree':
          dataModel.clearPartition();
          dataModel.setFilter('artist_degree', true, 'eq');
        }
      };

      var dataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/povertyrate'
      });

      var mainNumberWidget = new Y.BMP.Widget.AnimatedNumberChart({
        dataSource: dataModel,
        dataProperty: 'povertyRate',
        numberFormatConfig: {
          decimalPlaces: 1,
          suffix: '%'
        },
        sizeEffect: {
          valueA: 10,
          sizeA: 100,

          valueB: 30,
          sizeB: 120,

          duration: 1
        }
      });

      mainNumberWidget.render(Y.one('.main-chart-wrapper').empty());

      // dataModel.load();

      new Y.BMP.ButtonController({
        dataSource: dataModel,
        buttonContainer: Y.one('.controls'),
        load: true
      });

      Y.one('.artist-chooser').delegate('change', function(e) {
        var button = e.target;
        var filterType = button.get('value');
        setArtistFilter(filterType, dataModel);
        dataModel.load();

      }, 'input');
      

    },

    renderNav: function() {
      var nav = new Y.BMP.Widget.DropdownNav();
      nav.render(Y.one('h1').empty());
    }
  };
}, '1.0', {
  requires:[
    'base',
    'bmp-button-controller',
    'bmp-model-basic',
    'bmp-plugins-toggle-buttons',
    'bmp-widget-animated-number',
    'bmp-widget-dropdown-nav',
    'event',
    'node',
    'node-pluginhost'
  ]
});