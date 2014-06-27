/**
 * The module to initialize the rentburden pace
 * @module bmp-page-rentburden
 */
YUI.add('bmp-page-artistclasses', function(Y) {
  Y.namespace('BMP.Page').ArtistClasses = {

    pieChartOptions: {
      height: 300,
      legend: {
        position: 'labeled'
      }
    },

    smallPieChartOptions: Y.merge(this.pieChartOptions, {
      height: 300,
      legend: {
        position: 'bottom'
      },
      fontSize: 8,
      // pieSliceText: 'label',
      pieSliceTextStyle: {
        fontSize: 7
      }
    }),

    getPieChartOptions: function() {
      if (Y.DOM.winWidth() > 480) {
        return this.pieChartOptions;
      } else {
        return this.smallPieChartOptions;
      }
    },

    initializePage: function() {
      this._renderOccupationClasses();
      this._renderDegrees();
      this._renderOccupations();

    },

    _renderOccupationClasses: function() {
      var chart = new Y.BMP.Widget.GChart({
        chartType: 'PieChart',
        options: Y.merge(this.getPieChartOptions(),
        {
          colors: ['#6E5321', '#211B11', '#2C486E']
        }),
        // dataSource: dataModel
        dataTable: STATIC_CHART_DATA.artistClasses
        
      });

      chart.render(Y.one('.section.occupation .classes-chart-wrapper').empty());
    },

    _renderOccupations: function() {
      var chart = new Y.BMP.Widget.GChart({
        chartType: 'BarChart',
        options: {
          title: 'Approximate Number of People in NYC in Each Creative Occupation',
          height: 600,
          legend: {
            position: 'none'
          },
          chartArea: {
            width: '60%',
            height: '90%',
            right: 0,
            bottom: 0
          },
          fontSize: 10
        },
        dataTable: STATIC_CHART_DATA.allOccupations
      });

      chart.render(Y.one('.section.occupation .occp-chart-wrapper').empty());
    },

    _renderDegrees: function() {

      var chart = new Y.BMP.Widget.GChart({
        chartType: 'PieChart',
        options: this.getPieChartOptions(),
        dataTable: STATIC_CHART_DATA.artDegrees
      });

      chart.render(Y.one('.section.degree .chart-wrapper').empty());

    }

  };
}, '1.0', {
  requires:[
    'bmp-data-preparer',
    'bmp-widget-gchart',
    'node',
    'dom-screen'
  ]
});