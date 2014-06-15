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

  Y.BMP.DataPreparers = {

    rentBurden: function(response) {
      var rawData = response.results;
      var output = new Array(4);
      output[0] = ['Rent Burden Class', 'Non-artist', 'Artist'];

      // rows could appear in any order - order them by code because that makes sense
      Y.Array.each(rawData, function(row) {
        var code = parseInt(row[0], 10);
        row[0] = rentBurdenDefinitions[code];

        output.splice(code + 1, 1, row);
      });

      return output;
    }
  };
}, '1.0', {
  requires:[
    'array-extras'
  ]
});