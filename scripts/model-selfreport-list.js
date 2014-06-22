/**
 * The module containing the SelfReportList
 * @module bmp-model-selfreport-list
 */
YUI.add('bmp-model-selfreport-list', function(Y) {

  Y.namespace('BMP.Model').SelfReport = Y.Base.create('SelfReport', Y.Model, [Y.ModelSync.REST], {
    root: '/api/selfreport/v1',

    toString: function() {
      debugger;
    }
  });

  var SelfReportList =
  /**
   * 
   * @class SelfReportList
   * @namespace BMP.Model
   * @extends ModelList
   * @uses Y.ModelSync.REST
   * @contructor
   */
  Y.namespace('BMP.Model').SelfReportList =
  Y.Base.create('SelfReportList', Y.ModelList, [Y.ModelSync.REST], {
    model: Y.BMP.Model.SelfReport

  }, {

    ATTRS:{
      
    }
  });

}, '1.0', {
  requires:[
    'model-sync-rest',
    'model-list',
    'base',
    'model'
  ]
});