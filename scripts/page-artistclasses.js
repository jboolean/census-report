/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-artistclasses', function(Y) {
  Y.namespace('BMP.Page').ArtistClasses = {

    initializePage: function() {

      var dataModel = new Y.BMP.Model.BasicModel({
        groupby: 'occp_artist_class',
        endpoint: '/api/acs',
        dataPreparer: Y.BMP.DataPreparers.getHeaderPreparerer(['Artist Class', '# Inividials'])
      });

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'PieChart',
        options: {
          height: 400
        },
        dataSource: dataModel
      });

      dataModel.setFilter('occp_artist_class', [1,2,3], 'in');

      chart.render(Y.one('.main-chart-wrapper').empty());

      dataModel.load();

    }

  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic',
    'bmp-plugins-toggle-buttons', 'node-pluginhost',
    'bmp-button-controller', 'bmp-data-preparer',
    'node', 'bmp-widget-dropdown-nav'
  ]
});