/**
 * @module bmp-widget-animated-number
 */
YUI.add('bmp-widget-animated-number', function(Y) {
  var AnimatedNumberChart =
  /**
   * A big number that animates and stiff
   * @class AnimatedNumberChart
   * @namespace BMP.Widget
   * @uses 
   * @contructor
   */
  Y.namespace('BMP.Widget').AnimatedNumberChart =
  Y.Base.create('AnimatedNumberChart', Y.Widget, [], {

    _lastNumber: 0,

    bindUI: function() {
      AnimatedNumberChart.superclass.bindUI.apply(this, arguments);
      
      var dataSource = this.get('dataSource');
      // dataSource.on('loaded', function() {
      //   this.syncUI();
      // }, this);
      
      dataSource.after('dataStateChange', function() {
        this.syncUI();
      }, this);

    },

    renderUI: function() {
      var cb = this.get('contentBox');

      cb.empty().append('<div class="number-text"></div>' +
        '<div class="loading-spinner"></div>');
    },

    syncUI: function() {

      var cb = this.get('contentBox');
      var bb = this.get('boundingBox');

      var dataSource = this.get('dataSource');

      var dataState = dataSource.get('dataState');

      var hasErrors = dataSource.get('errors').length > 0;

      bb.toggleClass('loading', dataState === 'initial' || dataState === 'loading');
      bb.toggleClass('load-failed', dataState === 'load-failed');
      bb.toggleClass('has-errors', hasErrors);

      if (dataState === 'load-failed' || hasErrors) {
        cb.setHTML('&mdash;');
        return;
      }

      if (dataState === 'loaded') {
        var number = dataSource.get('data')[this.get('dataProperty')];

        if (!Y.Lang.isNumber(number)) {
          throw 'Can\'t draw the number animation because it\'s not a number!';
        }

        // cb.set('text', Y.Number.format(number, this.get('numberFormatConfig')));
        this.setNumberInterpolated(number);
        this.setSize(number);
      }
    },

    setSize: function(number) {
      var config = this.get('sizeEffect');

      // make a "line" equation where number value is on the x axis and font percentage on y
      var slope = (config.sizeB - config.sizeA) / (config.valueB - config.valueA);
      var intercept = config.sizeA - (slope * config.valueA);

      //and calculate mx + b
      var fontSize = slope * number + intercept;

      this.get('contentBox').setStyle('fontSize', '' + fontSize + '%');
    },

    setNumberInterpolated: function(newNumber) {
      var fps = 10;
      var totalFrames = fps * this.get('sizeEffect').duration;

      var increment = (newNumber - this._lastNumber) / totalFrames;

      var msPerFrame = (1000.0 / 30);

      var cb = this.get('contentBox');

      if (newNumber === this._lastNumber) {
        this._setNumber(newNumber);
        return;
      }


      var intervalId;

      var cleanUp = Y.bind(function() {
        this._lastNumber = newNumber;
        this._setNumber(newNumber);
        window.clearInterval(intervalId);
      }, this);

      var currentNumber = this._lastNumber;

      var currentFrame = 0;

      var animate = Y.bind(function() {
        if (increment === 0) {
          return;
          // I don't know why this case happens
        }
        currentNumber += increment;
        this._setNumber(currentNumber);
        currentFrame += 1;

        if (currentFrame >= totalFrames) {
          cleanUp();
        }
      }, this);

      intervalId = window.setInterval(animate, msPerFrame);
    },

    _setNumber: function(number) {
      var numberFormatConfig = this.get('numberFormatConfig');
      this.get('contentBox').one('.number-text').set('text', Y.Number.format(number, numberFormatConfig));
    }

  }, {

    CSS_PREFIX: 'bmp-animated-number',

    ATTRS:{

      dataSource: {
        writeOnce: 'initOnly',
        validator: function(val) {
          return val instanceof Y.BMP.Model.BasicModel;
        }
      },

      /**
       * Path to find the number in the data source's data
       * @attribute dataProperty
       * @type      String
       */
      dataProperty: {
        validator: Y.Lang.isString
      },

      numberFormatConfig: {
        value: {},
        writeOnce: 'initOnly'
      },

      sizeEffect: {
        value: {
          valueA: 0,
          sizeA: 100,

          valueB: 100,
          sizeB: 200,

          duration: 1
        }
      }

    }
  });
}, '1.0', {
  requires:[
    'widget',
    'base',
    'datatype-number-format'
  ]
});