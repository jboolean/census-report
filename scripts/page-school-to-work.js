/**
 * The module to initialize the rentburden pace
 * @module bmp-page-school-to-work
 */
YUI.add('bmp-page-school-to-work', function(Y) {

  FOD1P_DEFINITONS = {
    6000: 'Fine Arts',
    6001: 'Drama And Theater Arts',
    6002: 'Music',
    6003: 'Visual And Performing Arts',
    6004: 'Commercial Art And Graphic Design',
    6005: 'Film Video And Photographic Arts',
    6006: 'Art History And Criticism',
    6007: 'Studio Arts',
    6099: 'Miscellaneous Fine Arts'
  };

  Y.namespace('BMP.Page').SchoolToWork = {
    initializePage: function() {

      var dataModel = this._dataModel = new Y.BMP.Model.BasicModel({
        // groupby: 'grpip_group3',
        endpoint: '/api/acs/custom/schooltowork'
        // groupby: ['fod1p', 'occp']
        // dataPreparer: Y.BMP.DataPreparers.schoolToWorkSankey
      });

      dataModel.setFilter('fod1p', [6000,6099], 'between');

      var chart = new Y.BMP.Widget.DataSourcedChart({
        chartType: 'Sankey',
        options: {
          height: 3500,
          sankey: {
            iterations: 100,
            node: {
              width: 10
            }
          }
        },
        dataSource: dataModel
      });

      chart.on('select', function(e) {
        // So there's a knows issue with Sankey charts - they do not fire 'select'
        // Google does not seem interested in fixing this
        console.log('hey! It\'s a wonderful day, sankey select just worked');
      });

      this.renderFilter();

      dataModel.load();
      chart.render(Y.one('.main-chart-wrapper').empty());

    },

    renderFilter: function() {
      var wrapper = Y.one('.fod1p-filter-wrapper');
      var select = Y.Node.create('<select name="fod1p-filter" class="form-control">');

      select.append(Y.Node.create('<option value="-1">All Fields</option>'));

      Y.Object.each(FOD1P_DEFINITONS, function(definiton, code) {
        select.append(Y.Lang.sub('<option value="{code}" selected>{definiton}</option>', {code: code, definiton: definiton}));
      });

      select.on('change', function(e) {
        var value = e.target.get('value');
        if (value != -1){
          this._dataModel.setFilter('fod1p', value, 'eq');
        } else {
          this._dataModel.removeFilter('fod1p');
        }
        this._dataModel.load();
      }, this);

      wrapper.empty().append(select);
    }
  };
}, '1.0', {
  requires:[
    'bmp-widget-datasourced-chart', 'bmp-model-basic', 'bmp-data-preparer', 'node'
  ]
});