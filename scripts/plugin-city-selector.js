/**
 * The module containing the CitySelector
 * @module bmp-plugin-city-selector
 */
YUI.add('bmp-plugin-city-selector', function(Y) {
  var CitySelector =
  /**
   * 
   * @class CitySelector
   * @namespace BMP.Plugin
   * @extends Plugin.Base
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Plugin').CitySelector =
  Y.Base.create('CitySelector', Y.Plugin.Base, [], {

    initializer: function(config) {
      // var cityFiltersNode = Y.one('.filter-city');
      var cityFiltersNode = config.host;

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
        var newButton = cityFiltersNode.one('.btn:not(.active)').cloneNode(true);
        var radioBtn = cityFiltersNode.one('.btn:not(.active) input').cloneNode();
        newButton.set('text', cityName);
        radioBtn.setAttribute('value', cityCode);
        newButton.prepend(radioBtn);

        cityFiltersNode.one('.other').insert(newButton, 'before');
        radioBtn.getDOMNode().click();
        e.preventDefault();
        otherCityInput.set('value', '');

        this.fire('selected', {name: cityName, code: cityCode});

      }, this);
    }

  }, {
    NS: 'citySelector',
    ATTRS:{
      
    }
  });
}, '1.0', {
  requires:[
    'autocomplete',
    'autocomplete-filters',
    'plugin',
    'base',
    'event',
    'node',
    'node-event-simulate'
  ]
});