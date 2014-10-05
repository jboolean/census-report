/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-rentburden', function(Y) {
  Y.namespace('BMP.Page').RentBurden = {

    initializePage: function() {
      this.renderDefineArtistModal();

      // what the 'compare on' switch does
      var setPartition= function(partitionType, dataModel) {
        switch (partitionType) {
        case 'occp_artist_class':
          dataModel.clearPartition();
          dataModel.setPartitionFacet('artist_by_occupation', 'artists');
          break;
        case 'fod1p':
          dataModel.clearPartition();
          dataModel.setPartitionFacet('artist_by_education', 'artist');
        }
      };

      var dataModel = new Y.BMP.Model.BasicModel({
        // groupby: 'grpip_group3',
        endpoint: '/api/acs/custom/rentburden',
        dataPreparer: Y.BMP.DataPreparers.rentBurden
      });

      var gchart = new Y.BMP.Widget.GChart({
        chartType: 'ColumnChart',
        options: {
          height: 300,
          animation: {
            duration: 300,
            easing: 'out'
          },
          vAxis: {
            baseline: 0,
            minValue: 0,
            maxValue: 100
          },
          legend: {
            position: 'top'
          }
        }
      });

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chart: gchart,
        dataSource: dataModel
      });

      chart.render(Y.one('.main-chart-wrapper').empty());

      setPartition('occp_artist_class', dataModel);

      // dataModel.load();

      new Y.BMP.ButtonController({
        dataSource: dataModel,
        buttonContainer: Y.one('.filter-controls'),
        load: true
      });

      Y.one('.comparison-chooser').delegate('change', function(e) {
        var button = e.target;
        var partitionType = button.get('value');
        setPartition(partitionType, dataModel);
        dataModel.load();

      }, 'input');

      this._setupCitySelector();
      
      dataModel.on('loaded', this._updateCityText, this);


    },

    renderDefineArtistModal: function() {
      // Y.one('#defineArtistModal .modal-body').load('/artistclasses', '.container');
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
    'bmp-button-controller',
    'bmp-data-preparer',
    'bmp-model-basic',
    'bmp-plugin-city-selector',
    'bmp-plugins-toggle-buttons',
    'bmp-widget-datasourced-chart',
    'bmp-widget-gchart',
    'node',
    'node-load',
    'node-pluginhost'
  ]
});