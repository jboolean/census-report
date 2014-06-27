/**
 * Functions to preprocess data before display
 * @module bmp-data-preparer
 */
YUI.add('bmp-data-preparer', function(Y) {
  var rentBurdenDefinitions = {
    0: 'Not Rent Burdened',
    1: 'Rent Burdened',
    2: 'Severely Rent Burdened'
  };

  Y.namespace('BMP').DataPreparers = {

    rentBurden: function(response) {
      var rawData = response.results;
      var data = new Array(4);
      data[0] = ['Rent Burden Class', 'Artist', 'Non-artist'];

      // rows could appear in any order - order them by code because that makes sense
      Y.Array.each(rawData, function(row) {
        var code = parseInt(row[0], 10);
        row[0] = rentBurdenDefinitions[code];

        data.splice(code + 1, 1, row);
      });

      var dataTable = google.visualization.arrayToDataTable(data, false);

      var formatter = new google.visualization.NumberFormat({
        suffix: '%',
        fractionDigits: 0
      });
      formatter.format(dataTable, 1);
      formatter.format(dataTable, 2);
      return dataTable;
    },

    schoolToWorkSankey: function(response){
      var data = response.results;
      data.splice(0,0,['Field of Degree', 'Primary Occupation', '# People']);
      return data;
    },

    getHeaderPreparerer: function(headers) {
      return function(response) {
        var data = response.results;
        data.splice(0,0,headers);
        return data;
      };
    }
  };
}, '1.0', {
  requires:[
    'array-extras'
  ]
});