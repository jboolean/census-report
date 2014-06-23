/**
 * The module containing the SchoolToWorkSummary
 * @module bmp-widget-schooltowork-summary
 */
YUI.add('bmp-widget-schooltowork-summary', function(Y) {

  var DEFINITIONS_FOR_SENTENCE = {
    null: 'have no occupation right now',
    999: 'are not in the labor force',
    1: 'are professional artists',
    2: 'are educators',
    3: 'work in service jobs',
    4: 'work in sales and other office occupations',
    5: 'work in various blue collar occupations',
    6:  'are in the military',
    7:  'work in farming, fishing, and forestry',
    10: 'work in various professional fields',
    11: 'became managers',
    12: 'went on to work in business and finance',
    13: 'now work in science, technology or engineering',
    14: 'now work in medicine'
  };

  var SchoolToWorkSummary =
  /**
   * A textual summary of where people go from school. 
   * Datasourced by basic model grouped by occp_group
   * @class SchoolToWorkSummary
   * @namespace BMP.Widget
   * @extends Widget
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').SchoolToWorkSummary =
  Y.Base.create('SchoolToWorkSummary', Y.Widget, [], {

    maxToShow: 5,

    bindUI: function() {
      SchoolToWorkSummary.superclass.bindUI.apply(this, arguments);
      
      var dataSource = this.get('dataSource');
      dataSource.on('loaded', function() {
        this.syncUI();
      }, this);
    },

    syncUI: function() {
      var dataSource = this.get('dataSource');
      var dataState = dataSource.get('dataState');

      if (dataState === 'loaded') {
        var data = dataSource.get('data');
        this.get('contentBox').set('text', this._generateText(this._convertToPercentages(data)));
      }
    },

    _generateText: function(data) {
      var sentenceClauses = [];
      for (var i = 0; i < this.maxToShow && i < data.length; i++) {
        var value = data[i][1];
        if (value < 1) {
          break;
        }
        var percentStr = Y.Number.format(value, {
          decimalPlaces: 0,
          suffix: '%'
        });

        var clause = percentStr + ' ' + DEFINITIONS_FOR_SENTENCE[data[i][0]];
        sentenceClauses.push(clause);
      }

      var out = 'Of people who reported this as their degree field, ';

      Y.Array.each(sentenceClauses, function(clause, i, clauses) {
        var lastAndNotOnlyOne = i === clauses.length - 1 && clauses.length > 1;
        if (lastAndNotOnlyOne) {
          out += ' and ';
        }
        out += clause;
        if (!lastAndNotOnlyOne) {
          out += ', ';
        }
      });

      return out + '.';
    },

    _convertToPercentages: function(data) {
      var total = Y.Array.reduce(data, 0, function(last, cur) {
        return last + cur[1];
      });

      return Y.Array.map(data, function(cur) {
        if (total === 0) {
          return 0;
        }
        cur[1] = (cur[1]*100.0) / total;
        return cur;
      });
    }

  }, {
    CSS_PREFIX: 'bmp-schooltowork-summary',

    ATTRS:{

      /**
       * I want a sorted tally grouped by occp_group without descriptions, please.
       * @attribute dataSource
       * @type      ModelBasic
       */
      dataSource: {
        writeOnce: 'initOnly',
        validator: function(val) {
          return val instanceof Y.BMP.Model.BasicModel;
        }
      }
      
    }
  });
}, '1.0', {
  requires:[
    'array-extras',
    'widget',
    'datatype-number-format',
    'base'
  ]
  });