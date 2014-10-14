/**
 * The module containing the D3Sankey
 *
 * Totally stolen from http://www.d3noob.org/2013/02/sankey-diagrams-description-of-d3js-code.html
 * @module bmp-widget-d3-sankey
 */
YUI.add('bmp-widget-d3-sankey', function(Y) {
  var D3Sankey =
  /**
   * 
   * @class D3Sankey
   * @namespace BMP.Widget
   * @extends Widget
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').D3Sankey =
  Y.Base.create('D3Sankey', Y.Widget, [], {

    renderUI: function() {
      var cb = this.get('contentBox');

      // var width = this.get('width');
      // var height = this.get('height');

      //TODO

     



    },

    bindUI: function() {
      this.after('dataChange', this.syncUI, this);
      
    },

    syncUI: function() {
      var graph = this.get('data');


      if (!Y.Lang.isValue(graph)) {
        return;
      }

      this.get('contentBox').empty();

      var cbSelector = '#' + this.get('contentBox').generateID();


      var margin = this.get('margins');
      var cbWidth = +this.get('contentBox').getComputedStyle('width').match(/[0-9]*/)[0];
      var width = cbWidth - margin.left - margin.right;
      var height = (graph.nodes.length * this.get('perNodeAverageHeight') /2) - margin.top - margin.bottom;

      // this.get('contentBox').set('height', height + margin.top + margin.bottom);


      // append the svg canvas to the page
      var svg = d3.select(cbSelector)
        .append('svg')
          .attr('width', width + margin.left + margin.right)
          .attr('height', height + margin.top + margin.bottom)
        .append('g')
          .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

      svg.append('g');

      // Set the sankey diagram properties
      var sankey = this.sankey = d3.sankey()
          .nodeWidth(36)
          .nodePadding(40)
          .size([width, height]);





      // var sankey = this.sankey;

      // set data
      sankey
        .nodes(graph.nodes)
        .links(graph.links)
        .layout(32);


      // var margin = this.get('margins');
      var innerWidth = width;

      // add in the links
      // var svg = d3.select(cbSelector + ' svg');

      var format = this._format;
      var color = this._color;

      var path = sankey.link();

      var link = svg.append('g').selectAll('.link')
          .data(graph.links);

      var newLink = link.enter()
        .append('path')
          .attr('class', 'link')
          .attr('d', path)
          .style('stroke-width', function(d) { return Math.max(1, d.dy); })
          .style('stroke', function(d) {
            var hslColor = d3.rgb(color(d.target.node)).hsl();
            hslColor.s *= 0.7;
            return hslColor;
          })
          .sort(function(a, b) { return b.dy - a.dy; });

      link.exit().remove();

      // add the link titles
      link.append('title')
            .text(function(d) {
                return d.source.name + ' → ' +
                    d.target.name + '\n' + format(d.value);
              });

      // add in the nodes

      var node = d3.select(cbSelector)
        .select('svg g')
        .selectAll('.node')
        .data(graph.nodes);

      node.exit().remove();

      var newNode = node.enter()
          .append('g')
          .attr('class', 'node')
          .attr('transform', function(d) { return 'translate(' + d.x + ',' + d.y + ')'; });

      // add the rectangles for the nodes
      newNode.append('rect')
        .attr('height', function(d) { return d.dy; })
        .attr('width', sankey.nodeWidth())
        .style('fill', function(d) {
            d.color = color(d.node);
            return d.color;
          })
        .style('stroke', function(d) {
            return d3.rgb(d.color).darker(2);
          })
        .append('title')
          .text(function(d) {
              return d.name + '\n' + format(d.value);
            });


      // add in the title for the nodes
      newNode.append('text')
          .attr('x', -6)
          .attr('y', function(d) { return d.dy / 2; })
          .attr('dy', '.35em')
          .attr('text-anchor', 'end')
          .attr('transform', null)
          .text(function(d) { return d.name; })
        .filter(function(d) { return d.x < innerWidth / 2; })
          .attr('x', 6 + sankey.nodeWidth())
          .attr('text-anchor', 'start');

    },

    setData: function(newData) {
      this.set('data', newData);
    },

    _format: function(d) {
      var formatNumber = d3.format(',.0f');
      return formatNumber(d) + ' people';
          // color = d3.scale.category20();
    },

    _color: d3.scale.category20()


    

  }, {

    ATTRS:{
      data: {},

      perNodeAverageHeight: {
        value: 150,
        validator: Y.Lang.isNumber
      },
      margins: {
        value: {top: 10, right: 10, bottom: 10, left: 10}
      },

      nodeWidth: {

      }
    }
  });
}, '1.0', {
  requires:[
    'base',
    'thirdparty-sankey',
    'widget'
  ]
  });