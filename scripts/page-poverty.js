/**
 * The module to initialize the poverty page
 * @module bmp-page-poverty
 */
YUI.add('bmp-page-poverty', function(Y) {
  Y.namespace('BMP.Page').Poverty = {

    initializePage: function() {
      
      var setArtistFilter = function(partitionType, dataModel) {
        dataModel.removeFacet('artist_by_occupation');
        dataModel.removeFacet('artist_by_education');
        switch (partitionType) {
        case 'occ_artist_class':
          dataModel.clearPartition();
          dataModel.setFacet('artist_by_occupation', 'artists');
          break;
        case 'artist_degree':
          dataModel.clearPartition();
          dataModel.setFacet('artist_by_education', 'artist');
        }
      };

      var dataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/povertyrate'
      });

      var unfilteredDataModel = new Y.BMP.Model.BasicModel({
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


      var unfilteredNumberWidget = new Y.BMP.Widget.AnimatedNumberChart({
        dataSource: unfilteredDataModel,

        dataProperty: 'povertyRate',

        numberFormatConfig: {
          decimalPlaces: 1,
          suffix: '%'
        },

        sizeEffectEnabled: false
      });

      unfilteredNumberWidget.render(Y.one('.the-numbers .comparison.unfiltered .number'));

      // unfilteredDataModel.setFacet('city', 4610); // default to NYC. TODO: remove
      unfilteredDataModel.load();

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

      //city comparison number

      Y.one('.filter-city').delegate('change', function(e) {
        var node = Y.one('.the-numbers .comparison.unfiltered');

        var cityCode = e.target.get('value');
        if (cityCode == -1) {
          // unfilteredDataModel.removeFacet('city');
          node.hide();
        } else {
          unfilteredDataModel.setFacet('city', cityCode);
          unfilteredDataModel.load();
          node.show();
        }

      }, 'input');
      
      this._setupCitySelector();

      dataModel.on('loaded', this._updateCityText, this);

    },

    _setupCitySelector: function() {
      Y.one('body').addClass('yui3-skin-sam');

      var cityFiltersNode = Y.one('.filter-city');

      cityFiltersNode.plug(Y.BMP.Plugin.CitySelector);
    },

    _updateCityText: function() {
      var selectedButton = Y.one('.filter-city input:checked');
      if (!selectedButton) {
        return;
      }

      var cityCode = selectedButton.get('value');

      var label = selectedButton.ancestor('.btn');
      var cityName = label.get('text');

      if (cityCode == -1) {
        cityName = 'The United States';
      }

      Y.all('.location-name').set('text', cityName);
    }
  };
}, '1.0', {
  requires:[
    'autocomplete',
    'autocomplete-filters',
    'base',
    'bmp-button-controller',
    'bmp-model-basic',
    'bmp-plugin-city-selector',
    'bmp-plugins-toggle-buttons',
    'bmp-widget-animated-number',
    'event',
    'node',
    'node-pluginhost'
  ]
});