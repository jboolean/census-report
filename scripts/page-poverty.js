/**
 * The module to initialize the poverty page
 * @module bmp-page-poverty
 */
YUI.add('bmp-page-poverty', function(Y) {
  Y.namespace('BMP.Page').Poverty = {

    initializePage: function() {
      // this.renderNav();
      
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
      
      this._setupCitySelector();

    },

    _setupCitySelector: function() {
      Y.one('body').addClass('yui3-skin-sam');

      var cityFiltersNode = Y.one('.filter-city');

      var otherCityInput = cityFiltersNode.one('.other input');
      otherCityInput.plug(Y.Plugin.AutoComplete, {
        source: Y.Object.keys(CITIES_TO_CODES),
        resultFilters: 'startsWith',
        maxResults: 5
      });

      otherCityInput.ac.on('select', function(e) {
        var cityName = e.result.raw;
        var cityCode = CITIES_TO_CODES[cityName];
        if (!Y.Lang.isValue(cityCode)) {
          //TODO: Notify user of unsupperted city
          console.log('unsupported city');
          return;
        }

        //Clone a button
        var newButton = cityFiltersNode.one('.btn').cloneNode(true);
        var radioBtn = cityFiltersNode.one('.btn input').cloneNode();
        newButton.set('text', cityName);
        radioBtn.setAttribute('value', cityCode);
        newButton.prepend(radioBtn);

        cityFiltersNode.one('.other').insert(newButton, 'before');
        radioBtn.simulate('click');
        e.preventDefault();
        otherCityInput.set('value', '');

      }, this);
    },

    renderNav: function() {
      var nav = new Y.BMP.Widget.DropdownNav();
      nav.render(Y.one('h1').empty());
    }
  };
}, '1.0', {
  requires:[
    'autocomplete',
    'autocomplete-filters',
    'base',
    'bmp-button-controller',
    'bmp-model-basic',
    'bmp-plugins-toggle-buttons',
    'bmp-widget-animated-number',
    'bmp-widget-dropdown-nav',
    'event',
    'node',
    'node-pluginhost',
    'node-event-simulate'
  ]
});