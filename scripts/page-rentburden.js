/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-rentburden', function(Y) {
  Y.namespace('BMP.Page').RentBurden = {
    initializePage: function() {
      
      // what the 'compare on' switch does
      var setPartition= function(partitionType, dataModel) {
        switch (partitionType) {
        case 'occp_artist_class':
          dataModel.clearPartition();
          dataModel.setPartition('occp_artist_class', [1]);
          break;
        case 'fod1p':
          dataModel.clearPartition();
          dataModel.setPartition('fod1p', [6000,6099], 'between');
        }
      }

      var dataModel = new Y.BMP.Models.BasicModel({
        // groupby: 'grpip_group3',
        endpoint: '/api/acs/custom/rentburden',
        dataPreparer: Y.BMP.DataPreparers.rentBurden
      });

      var chart = new Y.BFAMFAPhD.Widget.GChart({
        chartType: 'ColumnChart',
        options: {
          // height: 1000
        },
        dataSource: dataModel
      });
      chart.render(Y.one('.main-chart-wrapper').empty());

      setPartition('occp_artist_class', dataModel);

      dataModel.load();

      Y.all('.btn-group[data-toggle=buttons]').plug(Y.BMP.Plugins.ToggleButtons);

      new Y.BMP.ButtonController({
        dataSource: dataModel,
        buttonContainer: Y.one('.controls')
      });

      Y.one('.comparison-chooser').delegate('change', function(e) {
        var button = e.target;
        var partitionType = button.get('value');
        setPartition(partitionType, dataModel);
        dataModel.load();

      }, 'input');
      

    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-gchart', 'bmp-models-basic',
    'bmp-plugins-toggle-buttons', 'node-pluginhost',
    'bmp-button-controller', 'bmp-data-preparer'
  ]
});