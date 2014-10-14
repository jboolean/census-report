YUI.add('bmp-data-preparer-schooltowork-d3-sankey', function(Y) {

  Y.namespace('BMP.DataPreparers').D3Sankey = function(response) {
    var rawData = response.results;

    // remove the first element, which is column names
    response.results.splice(0,1);

    var nameToIndex = {};
    var nextIndex = 0;

    var links = [];

    var findOrCreateNodeIndex = function(name) {
      if (!Y.Object.hasKey(nameToIndex, name)) {
        nameToIndex[name] = nextIndex++;
      }

      return nameToIndex[name];
    };

    Y.Array.each(rawData, function(rawLink) {
      var sourceName = rawLink[0];
      var targetName = rawLink[1];
      var count = rawLink[2];

      var sourceI = findOrCreateNodeIndex(sourceName);
      var targetI = findOrCreateNodeIndex(targetName);

      links.push({
        source: sourceI,
        target: targetI,
        value: count
      });


    }, this);

    nodes = [];

    Y.Object.each(nameToIndex, function(index, name) {
      nodes.push({
        node: index,
        name: name
      });
    });

    return {
      nodes: nodes,
      links: links
    };

  };
  
}, '1.0', {
  requires:[
  ]
});