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
    model: null,
    initializePage: function() {

      var dataModel = this._dataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/schooltowork/flow',
        dataPreparer: Y.BMP.DataPreparers.D3Sankey
      });

      var summaryDataModel = this._summaryDataModel = new Y.BMP.Model.BasicModel({
        endpoint: '/api/acs/custom/schooltowork/groups'
      });

      dataModel.setFacet('artist_by_education', 'artist');
      summaryDataModel.setFacet('artist_by_education', 'artist');

      this.model = new Y.Model({'city': null, 'degree': null});

      this.model.after('change', this._handleFiltersChange, this);

      var d3chart = new Y.BMP.Widget.D3Sankey();

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chart: d3chart,
        dataSource: dataModel
      });

      var summary = this._summaryWidget = new Y.BMP.Widget.SchoolToWorkSummary({
        dataSource: summaryDataModel,
        displayedFilterText: 'all people with an arts degree'
      });

      this.renderFilter();

      Y.one('#filter-city').after('change', Y.bind(function(e) {
        var value = e.target.get('value');

        var cityName = e.target.one(':checked').get('text');

        this.model.set('city', value == -1 ? null : value);

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

      // select.on('change', this._handleFilterChange, this);
      select.after('change', function(e) {
        var value = e.target.get('value');
        this.model.set('degree', value == -1 ? null : value);
      }, this);

      wrapper.empty().append(select);
    },

    _handleFiltersChange: function() {
      //update datasource from this.model and reload
      var model = this.model;

      this._dataModel.removeFacet('artist_by_education');
      this._summaryDataModel.removeFacet('artist_by_education');

      var degree = model.get('degree');
      var city = model.get('city');

      var cityName = Y.Lang.isValue(city) ? CODES_TO_CITIES[city] : 'The United States' ;

      var populationDescription = 'people in ' + cityName;

      if (degree !== null){
        populationDescription += ' who reported ' +
          FOD1P_DEFINITONS[degree] + ' as their degree field';
        this._dataModel.setFacet('degfield', degree);
        this._summaryDataModel.setFacet('degfield', degree);
      } else {
        // no filter actually means filter to all "art" majors (non commercial)
        populationDescription += ' with an art degree';
        this._dataModel.removeFacet('degfield');
        this._summaryDataModel.removeFacet('degfield');
        this._dataModel.setFacet('artist_by_education', 'artist');
        this._summaryDataModel.setFacet('artist_by_education', 'artist');
      }

      if (city !== null) {
        this._dataModel.setFacet('city', city);
        this._summaryDataModel.setFacet('city', city);
      } else {
        this._dataModel.removeFacet('city');
        this._summaryDataModel.removeFacet('city');
      }

      this._summaryWidget.set('displayedFilterText', populationDescription);

      this._dataModel.load();
      this._summaryDataModel.load();

      Y.all('.location-name').set('text', cityName);

    }
  };
}, '1.0', {
  requires:[
    'array-extras',
    'bmp-data-preparer-schooltowork-d3-sankey', 
    'bmp-model-basic',
    'bmp-widget-d3-sankey', 
    'bmp-widget-datasourced-chart', 
    'bmp-widget-schooltowork-summary', 
    'model',
    'node'
  ]
});