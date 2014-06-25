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

  CODES_DISPLAY_ORDER = [-1, 6001, 6002, 6003, 6004, 6005, 6006, 6007];

  Y.namespace('BMP.Page').SchoolToWork = {
    initializePage: function() {

      // this.renderNav();

      var dataModel = this._dataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/schooltowork'
      });

      var summaryDataModel = this._summaryDataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs',
        groupby: 'occp_group',
        useDescriptions: false,
        sort: true
      });

      dataModel.setFilter('fod1p', [6000,6099], 'between');
      summaryDataModel.setFilter('fod1p', [6000,6099], 'between');

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'Sankey',
        options: {
          height: 2500,
          sankey: {
            iterations: 100,
            node: {
              width: 10
            }
          }
        },
        dataSource: dataModel
      });

      var summary = this._summaryWidget = new Y.BMP.Widget.SchoolToWorkSummary({
        dataSource: summaryDataModel,
        displayedFilterText: 'all people in NYC with an art degree'
      });

      chart.on('select', function(e) {
        // So there's a knows issue with Sankey charts - they do not fire 'select'
        // Google does not seem interested in fixing this
        console.log('hey! It\'s a wonderful day, sankey select just worked');
      });

      this.renderFilter();

      dataModel.load();
      summaryDataModel.load();
      chart.render(Y.one('.main-chart-wrapper').empty());
      summary.render(Y.one('.summary-wrapper'));

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
      if (value != -1){
        this._summaryWidget.set('displayedFilterText', 'people who reported ' +
          FOD1P_DEFINITONS[value] + ' as their degree field');
        this._dataModel.setFilter('fod1p', value, 'eq');
        this._summaryDataModel.setFilter('fod1p', value, 'eq');
      } else {
        // no filter actually means filter to all art majors
        this._summaryWidget.set('displayedFilterText', 'all people in NYC with an art degree');
        this._dataModel.setFilter('fod1p', [6000,6099], 'between');
        this._summaryDataModel.setFilter('fod1p', [6000,6099], 'between');
      }
      this._dataModel.load();
      this._summaryDataModel.load();
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic',
    'bmp-data-preparer', 'node', 'bmp-widget-dropdown-nav',
    'bmp-widget-schooltowork-summary'
  ]
});