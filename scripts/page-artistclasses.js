/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-artistclasses', function(Y) {
  Y.namespace('BMP.Page').ArtistClasses = {

    initializePage: function() {
      this._renderOccupationClasses();
      this._renderDegrees();
      this._renderOccupations();

    },

    _renderOccupationClasses: function() {
      var dataModel = new Y.BMP.Model.BasicModel({
        groupby: 'occp_artist_class',
        endpoint: '/api/acs',
        dataPreparer: Y.BMP.DataPreparers.getHeaderPreparerer(['Artist Class', '# Individuals'])
      });

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'PieChart',
        options: {
          height: 300,
          legend: {
            position: 'labeled'
          }
        },
        dataSource: dataModel
      });

      dataModel.setFilter('occp_artist_class', [1,2,3], 'in');

      chart.render(Y.one('.section.occupation .classes-chart-wrapper').empty());

      dataModel.load();
    },

    _renderOccupations: function() {
      var dataModel = new Y.BMP.Model.BasicModel({
        groupby: 'occp',
        endpoint: '/api/acs',
        dataPreparer: Y.BMP.DataPreparers.getHeaderPreparerer(['Occupation', 'Approx. # Individuals'])
      });

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'BarChart',
        options: {
          height: 600,
          legend: {
            position: 'bottom'
          }
        },
        dataSource: dataModel
      });

      dataModel.setFilter('occp_artist_class', [1,2,3], 'in');

      chart.render(Y.one('.section.occupation .occp-chart-wrapper').empty());

      dataModel.load();
    },

    _renderDegrees: function() {
      var dataModel = new Y.BMP.Model.BasicModel({
        groupby: 'fod1p',
        endpoint: '/api/acs',
        dataPreparer: Y.BMP.DataPreparers.getHeaderPreparerer(['Degree', '# Individuals'])
      });

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'PieChart',
        options: {
          height: 600,
          legend: {
            position: 'left'
          }
        },
        dataSource: dataModel
      });

      dataModel.setFilter('fod1p', [6000, 6099], 'between');

      chart.render(Y.one('.section.degree .chart-wrapper').empty());

      dataModel.load();
    }

  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic',
    'bmp-data-preparer',
    'node'
  ]
});