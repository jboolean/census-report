/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-rentburden', function(Y) {
  Y.namespace('BMP.Page').RentBurden = {

    initializePage: function() {
      // this.renderNav();
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

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'ColumnChart',
        options: {
          height: 300,
          animation: {
            duration: 300,
            easing: 'out'
          },
          vAxis: {
            baseline: 0,
            minValue: 0
          },
          legend: {
            position: 'top'
          }
        },
        dataSource: dataModel
      });
      chart.render(Y.one('.main-chart-wrapper').empty());

      setPartition('occp_artist_class', dataModel);

      dataModel.load();

      new Y.BMP.ButtonController({
        dataSource: dataModel,
        buttonContainer: Y.one('.filter-controls')
      });

      Y.one('.comparison-chooser').delegate('change', function(e) {
        var button = e.target;
        var partitionType = button.get('value');
        setPartition(partitionType, dataModel);
        dataModel.load();

      }, 'input');
      

    },

    renderNav: function() {
      var nav = new Y.BMP.Widget.DropdownNav();
      nav.render(Y.one('h1').empty());
    },

    renderDefineArtistModal: function() {
      // Y.one('#defineArtistModal .modal-body').load('/artistclasses', '.container');
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic',
    'bmp-plugins-toggle-buttons', 'node-pluginhost',
    'bmp-button-controller', 'bmp-data-preparer',
    'node', 'bmp-widget-dropdown-nav', 'node-load'
  ]
});