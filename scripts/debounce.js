/**
 * A debouncer.
 * @module bmp-debounce
 */
YUI.add('bmp-debounce', function(Y) {
  Y.namespace('BMP.Util').Debounce = function(fn, ms, ctx) {
    fn = Y.bind(fn, ctx || this);
    var handle = null;
    return function() {
      if (handle) {
        window.clearTimeout(handle);
      }
      var args = Array.prototype.slice.call(arguments);
      handle = window.setTimeout.apply(window, [fn, ms].concat(args));
    };
  };
}
);