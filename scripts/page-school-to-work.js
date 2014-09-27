/**
 * The module to initialize the rentburden pace
 * @module bmp-page-school-to-work
 */
YUI.add('bmp-page-school-to-work', function(Y) {

  FOD1P_DEFINITONS = {
    '-1': 'All Art Fields',
    6000: 'Fine Arts',
    6001: 'Drama And Theater Arts',
    6002: 'Music',
    6003: 'Visual And Performing Arts',
    6004: 'Commercial Art And Graphic Design',
    6005: 'Film Video And Photographic Arts',
    6006: 'Art History And Criticism',
    6007: 'Studio Arts'
    // 6099: 'Miscellaneous Fine Arts'
  };

  CODES_DISPLAY_ORDER = [-1, 6001, 6002, 6003, 6005, 6006, 6007];

  Y.namespace('BMP.Page').SchoolToWork = {
    initializePage: function() {

      // this.renderNav();

      var dataModel = this._dataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/schooltowork/flow',
        dataPreparer: Y.BMP.DataPreparers.D3Sankey
      });

      var summaryDataModel = this._summaryDataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/schooltowork/groups'
      });

      dataModel.setFacet('artist_by_education', 'artist');
      summaryDataModel.setFacet('artist_by_education', 'artist');

      // var chart = new Y.BMP.Widget.DataSourcedChart({
      //   chartType: 'Sankey',
      //   options: {
      //     enableInteractivity: false,
      //     // height: 2500,
      //     height: 3500,
      //     // height: 1500,
      //     sankey: {
      //       iterations: 100,
      //       node: {
      //         width: 10
      //       }
      //     }
      //   },
      //   dataSource: dataModel
      // });

      var d3chart = new Y.BMP.Widget.D3Sankey();

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chart: d3chart,
        dataSource: dataModel
      });

      var summary = this._summaryWidget = new Y.BMP.Widget.SchoolToWorkSummary({
        dataSource: summaryDataModel,
        displayedFilterText: 'all people with an arts degree'
      });

      chart.on('select', function(e) {
        // So there's a knows issue with Sankey charts - they do not fire 'select'
        // Google does not seem interested in fixing this
        console.log('hey! It\'s a wonderful day, sankey select just worked');
      });

      this.renderFilter();

      Y.one('#filter-city').after('change', Y.bind(function(e) {
        var value = e.target.get('value');

        var cityName = e.target.one(':checked').get('text');

        if (value != -1) {
          dataModel.setFacet('city', value);
          summaryDataModel.setFacet('city', value);
        } else {
          dataModel.removeFacet('city');
          summaryDataModel.removeFacet('city');
        }

        this._dataModel.load();
        this._summaryDataModel.load();

        Y.all('.location-name').set('text', cityName);
      }, this));

      dataModel.load();
      summaryDataModel.load();
      chart.render(Y.one('.main-chart-wrapper').empty());
      summary.render(Y.one('.summary-wrapper'));

      dataModel.after('loaded', function() {
        var otherList = Y.one('.other-list').empty();
        Y.Array.each(dataModel.get('rawResponse').otherOccupations, function(occupation) {
          var li = Y.Node.create('<li>');
          li.set('text', occupation);
          otherList.append(li);
        });
      });

    },

    renderFilter: function() {
      var wrapper = Y.one('.fod1p-filter-wrapper');
      var select = Y.Node.create('<select name="fod1p-filter" class="form-control">');

      Y.Array.each(CODES_DISPLAY_ORDER, function(code, i) {
        var definiton = FOD1P_DEFINITONS[code];
        select.append(Y.Lang.sub('<option value="{code}">{definiton}</option>', {code: code, definiton: definiton}));
      });

      select.on('change', this._handleFilterChange, this);

      wrapper.empty().append(select);
    },

    renderNav: function() {
      var nav = new Y.BMP.Widget.DropdownNav();
      nav.render(Y.one('h1').empty());
    },

    _handleFilterChange: function(e) {
      var value = e.target.get('value');

      this._dataModel.removeFacet('artist_by_education');
      this._summaryDataModel.removeFacet('artist_by_education');
      
      // this._dataModel.removeFilter('fod1p_artist');
      // this._summaryDataModel.removeFilter('fod1p_artist');

      if (value != -1){
        this._summaryWidget.set('displayedFilterText', 'people who reported ' +
          FOD1P_DEFINITONS[value] + ' as their degree field');
        this._dataModel.setFacet('degfield', value);
        this._summaryDataModel.setFacet('degfield', value);
      } else {
        // no filter actually means filter to all "art" majors (non commercial)
        this._summaryWidget.set('displayedFilterText', 'all people with an art degree');
        this._dataModel.removeFacet('degfield');
        this._summaryDataModel.removeFacet('degfield');
        this._dataModel.setFacet('artist_by_education', 'artist');
        this._summaryDataModel.setFacet('artist_by_education', 'artist');
      }
      this._dataModel.load();
      this._summaryDataModel.load();
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic',
    'node', 'bmp-widget-dropdown-nav',
    'bmp-widget-schooltowork-summary', 'array-extras',
    'bmp-widget-d3-sankey', 'bmp-data-preparer-schooltowork-d3-sankey'
  ]
});