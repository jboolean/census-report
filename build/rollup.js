YUI.add("bmp-widget-dropdown-nav",function(t){var e=t.namespace("BMP.Widget").DropdownNav=t.Base.create("DropdownNav",t.Widget,[],{renderUI:function(){var n=this.get("activePath"),o=t.Array.find(this.get("items"),function(t){return 0===n.indexOf(t.url)}),a=this.get("contentBox"),r=t.Node.create(e.TEMPLATE),i=t.Object.getValue(o,["title"])||"Menu";r.one(".active-text").set("text",i);var s=r.one("ul");t.Array.each(this.get("items"),function(e){var n=t.Lang.sub('<li><a href="{url}">{title}</a></li>',e),a=t.Node.create(n);e===o&&a.addClass("active"),s.append(a)}),a.empty().append(r)},bindUI:function(){this.get("contentBox").all(".dropdown-toggle").on("tap",function(e){this.toggleOpen(),e.halt(!0),this._bodyListener=t.one("body").on("tap",function(t){t.target.ancestor(".dropdown",!0)||this.toggleOpen(!1)},null,this)},null,this)},toggleOpen:function(t){var e=this.get("contentBox").one(".dropdown");e.toggleClass("open",t);var n=e.hasClass("open");!n&&this._bodyListener&&this._bodyListener.detach()}},{TEMPLATE:'Exploring: <div class="dropdown"><a class="dropdown-toggle"><span class="active-text">Dropdown text</span><span class="caret"></span></a><ul></ul></div>',CSS_PREFIX:"bmp-dropdown-nav",ATTRS:{items:{value:[{url:"/poverty",title:"Poverty Rates"},{url:"/rentburden",title:"Rent Burden"},{url:"/schooltowork",title:"Art School & Occupation"},{url:"/selfreport",title:"You"},{url:"/artistclasses",title:"Artist"}]},activePath:{valueFn:function(){return window.location.pathname}}}})},"1.0",{requires:["base","event","widget-base","array-extras"]});
YUI.add("bmp-page-main-nav",function(n){n.namespace("BMP.Page").MainNav={initializePage:function(){this._dropdownNav=new n.BMP.Widget.DropdownNav,this._dropdownNav.render(n.one("nav .dropdown-wrapper"))}}},"1.0",{requires:["bmp-widget-dropdown-nav","base"]});
YUI().add("jsb-data-util",function(n){var t=function(t){return function(r,e){if(!n.Lang.isFunction(t))return null;var i=n.JSON.parse(e.responseText);n.bind(t,this)(i)}};n.Data={_go:function(r,e,i){var o="application/json";return"POST"===r&&(o="application/x-www-form-urlencoded"),new n.Promise(function(u,s){n.io(e.url,{method:r,headers:{"Content-Type":o},data:n.QueryString.stringify(e.data),on:{success:t(u),failure:t(s)},context:i})})},get:function(n,t){return this._go("GET",n,t)},put:function(n,t){return this._go("PUT",n,t)},post:function(n,t){return this._go("POST",n,t)}}},"1.0",{requires:["io-base","json-parse","node","querystring-parse","promise"]});
YUI.add("bmp-data-preparer",function(r){var e={0:"Not Rent Burdened",1:"Rent Burdened",2:"Severely Rent Burdened"};r.namespace("BMP").DataPreparers={rentBurden:function(a){var t=a.results,n=new Array(4);n[0]=["Rent Burden Class","Artist","Non-artist"],r.Array.each(t,function(r){var a=parseInt(r[0],10);r[0]=e[a],n.splice(a+1,1,r)});var o=google.visualization.arrayToDataTable(n,!1),i=new google.visualization.NumberFormat({suffix:"%",fractionDigits:0});return i.format(o,1),i.format(o,2),o},schoolToWorkSankey:function(r){var e=r.results;return e.splice(0,0,["Field of Degree","Primary Occupation","# People"]),e},getHeaderPreparerer:function(r){return function(e){var a=e.results;return a.splice(0,0,r),a}}}},"1.0",{requires:["array-extras"]});
YUI.add("bmp-model-basic",function(t){var e=t.namespace("BMP.Model").BasicModel=t.Base.create("BasicModel",t.Base,[],{initializer:function(){this.publish("loaded"),this.publish("load-failed"),this._filters={},this._partitions={}},setFilter:function(t,e,i){this._setFilterOrPartition(this._filters,t,e,i)},setPartition:function(t,e,i){this._setFilterOrPartition(this._partitions,t,e,i)},clearPartition:function(){this._partitions={}},_setFilterOrPartition:function(e,i,a,r){return t.Lang.isValue(a)&&!t.Lang.isArray(a)&&(a=[a]),t.Lang.isArray(a)&&0!==a.length?(t.Lang.isValue(r)||(r="in"),void(e[i]={operator:r,values:a})):void this.removeFilter(i)},removeFilter:function(t){delete this._filters[t]},_getQueryParams:function(){return params={groupby:this.get("groupby").join(","),use_descriptions:this.get("useDescriptions"),sort:this.get("sort")},params=t.merge(params,this._createFilterQueryParams(this._filters)),params=t.merge(params,this._createFilterQueryParams(this._partitions,"partition"))},_createFilterQueryParams:function(e,i){var a={};return i||(i="filter"),t.Object.each(e,function(t,e){a[i+"_"+t.operator+"_"+e.toLowerCase()]=t.values.join(",")},this),a},load:function(){return this.set("dataState","loading"),this._loadCached(this.get("endpoint"),this._getQueryParams()).then(t.bind(function(e){var i=e.results;return t.Lang.isFunction(this.get("dataPreparer"))&&(i=this.get("dataPreparer")(e)),this.setAttrs({data:i,populationSize:e.populationSize,dataState:"loaded",errors:[]}),this.updateErrors(),this.set("dataState","loaded"),this.fire("loaded"),e},this),t.bind(function(){console.error("Data load error"),this.set("errors","Data could not be loaded."),this.set("dataState","load-failed"),this.fire("load-failed")},this))},_loadCached:function(i,a){var r=i+"__"+t.QueryString.stringify(a);return t.Object.hasKey(e._cache,r)?t.when(t.clone(e._cache[r])):t.Data.get({url:i,data:a},this).then(t.bind(function(i){return e._cache[r]=i,t.clone(i)},this))},updateErrors:function(){var e=this.get("errors"),i=2e3,a=!0;t.Lang.isNumber(this.get("populationSize"))&&(a=this.get("populationSize")>=i),t.Lang.isArray(this.get("populationSize"))&&(a=null===t.Array.find(this.get("populationSize"),function(t){return i>t})),a||e.push("Not enough data"),this.set("errors",e)}},{_cache:{},ATTRS:{groupby:{value:[],setter:function(e){return t.Lang.isArray(e)?e:[e]}},useDescriptions:{value:!0,validator:t.Lang.isBoolean},sort:{value:!1,validator:t.Lang.isBoolean},dataPreparer:{},data:{value:null},populationSize:{},endpoint:{value:"/api/acs"},dataState:{value:"initial"},errors:{value:[]}}})},"1.0",{requires:["array-extras","base","jsb-data-util","promise","querystring-stringify"]});
YUI.add("bmp-widget-gchart",function(t){var e=t.namespace("BMP.Widget").GChart=t.Base.create("GChart",t.Widget,[],{initializer:function(e){t.Lang.isArray(e.options.colors)||(e.options.colors=["#2C486E","#211B11","#6E5321","#2E1D1C","#3C4754","#111821","#262254"]),this._wrapper=new google.visualization.ChartWrapper(e),google.visualization.events.addListener(this._wrapper,"ready",t.bind(this._bindChartEvents,this)),this.publish("select")},renderUI:function(){var e=this.get("contentBox");e.append(t.Node.create('<div class="inner-chart-wrapper"></div>'))},syncUI:function(){e.superclass.syncUI.apply(this,arguments);var t=this.get("contentBox"),i=t.one(".inner-chart-wrapper");this._wrapper.draw(i.getDOMNode())},bindUI:function(){this.on("optionsChange",function(t){this._wrapper.setOptions(t.newVal),this.syncUI()},this),this.on("dataTableChange",function(t){this._wrapper.setDataTable(t.newVal),this.syncUI()},this),this.on("chartTypeChange",function(t){this._wrapper.setChartType(t.newVal),this.syncUI()},this),window.onresize=t.throttle(t.bind(this.syncUI,this),500)},_bindChartEvents:function(){google.visualization.events.addListener(this._wrapper.getChart(),"select",t.bind(function(){this.fire("select",this._wrapper.getChart().getSelection())},this))}},{CSS_PREFIX:"bmp-gchart",ATTRS:{chartType:{required:!0,validator:t.Lang.isString},dataTable:{required:!0},options:{validator:t.Lang.isObject,value:{}}}})},"1.0",{requires:["widget-base","event-resize","event","base","yui-throttle"]});
YUI.add("bmp-widget-datasourced-chart",function(a){var e=a.namespace("BMP.Widget").DataSourcedChart=a.Base.create("DataSourcedChart",a.BMP.Widget.GChart,[],{bindUI:function(){e.superclass.bindUI.apply(this,arguments);var a=this.get("dataSource");a.on("loaded",function(){this.set("dataTable",a.get("data"))},this),a.on("dataStateChange",function(){this.syncUI()},this)},syncUI:function(){var t=this.get("contentBox"),r=this.get("dataSource");t.all(".error, .alert").remove(!0);var i=r.get("dataState");if("initial"!==i)if("loading"===i)t.append(a.Node.create('<div class="alert alert-info">Loading</div>'));else{e.superclass.syncUI.apply(this,arguments);var n=!1,s=r.get("errors");a.Array.each(s,function(e){var r=a.Node.create('<div class="error alert alert-warning"></div>');r.set("text",e),t.append(r),n=!0});var d=t.one(".inner-chart-wrapper");d.toggleView(!n)}}},{ATTRS:{dataSource:{writeOnce:"initOnly",validator:function(e){return e instanceof a.BMP.Model.BasicModel}}}})},"1.0",{requires:["bmp-widget-gchart","base"]});
YUI.add("bmp-plugins-toggle-buttons",function(t){t.namespace("BMP.Plugins").ToggleButtons=t.Base.create("ToggleButtons",t.Plugin.Base,[],{initializer:function(){var t=this.get("host");t.delegate("tap",this._toggle,".btn",this)},_toggle:function(t){var e=t.target.ancestor(".btn",!0);this.get("multi")||e.siblings(".btn.active").removeClass("active"),e.addClass("active")}},{NS:"plugin-toggle-buttons",ATTRS:{multi:{value:!1,validator:t.Lang.isBoolean}}});t.all("[data-toggle=buttons]").plug(t.BMP.Plugins.ToggleButtons)},"1.0",{requires:["base","event","plugin"]});
YUI.add("bmp-button-controller",function(t){t.namespace("BMP").ButtonController=t.Base.create("ButtonController",t.Base,[],{initializer:function(t){var e=t.buttonContainer;e.delegate("change",this._onChange,"[data-filter-var]",this)},_onChange:function(e){var a=e.target.ancestor(".filter"),n=a.getAttribute("data-filter-var");if(t.Lang.isValue(n)){var r=[];a.all("input:checked").each(function(e){var a=e.get("value");t.Lang.isValue(a)&&-1!=a&&t.Array.each(a.split(","),function(t){r.push(t)})}),this.get("dataSource").setFilter(n,r),this.get("dataSource").load()}}},{ATTRS:{buttonContainer:{required:!0,validator:function(e){return e instanceof t.Node}},dataSource:{required:!0,validator:function(e){return e instanceof t.BMP.Model.BasicModel}}}})},"1.0",{requires:["base"]});
YUI.add("bmp-page-rentburden",function(e){e.namespace("BMP.Page").RentBurden={initializePage:function(){this.renderDefineArtistModal();var t=function(e,t){switch(e){case"occp_artist_class":t.clearPartition(),t.setPartition("occp_artist_class",[1]);break;case"fod1p":t.clearPartition(),t.setPartition("fod1p",[6e3,6099],"between")}},n=new e.BMP.Model.BasicModel({endpoint:"/api/acs/custom/rentburden",dataPreparer:e.BMP.DataPreparers.rentBurden}),a=new e.BMP.Widget.DataSourcedChart({chartType:"ColumnChart",options:{height:300,animation:{duration:300,easing:"out"},vAxis:{baseline:0,minValue:0},legend:{position:"top"}},dataSource:n});a.render(e.one(".main-chart-wrapper").empty()),t("occp_artist_class",n),n.load(),new e.BMP.ButtonController({dataSource:n,buttonContainer:e.one(".filter-controls")}),e.one(".comparison-chooser").delegate("change",function(e){var a=e.target,r=a.get("value");t(r,n),n.load()},"input")},renderNav:function(){var t=new e.BMP.Widget.DropdownNav;t.render(e.one("h1").empty())},renderDefineArtistModal:function(){}}},"1.0",{requires:["bmp-widget-datasourced-chart","bmp-model-basic","bmp-plugins-toggle-buttons","node-pluginhost","bmp-button-controller","bmp-data-preparer","node","bmp-widget-dropdown-nav","node-load"]});
YUI.add("bmp-page-poverty",function(e){e.namespace("BMP.Page").Poverty={initializePage:function(){var t=function(e,t){switch(t.removeFilter("occp_artist_class"),t.removeFilter("fod1p"),e){case"occp_artist_class":t.clearPartition(),t.setFilter("occp_artist_class",[1]);break;case"fod1p":t.clearPartition(),t.setFilter("fod1p",[6e3,6099],"between")}},a=new e.BMP.Model.BasicModel({endpoint:"/api/acs/custom/povertyrate"}),o=new e.BMP.Widget.AnimatedNumberChart({dataSource:a,dataProperty:"povertyRate",numberFormatConfig:{decimalPlaces:1,suffix:"%"},sizeEffect:{valueA:10,sizeA:100,valueB:30,sizeB:120,duration:1}});o.render(e.one(".main-chart-wrapper").empty()),a.load(),new e.BMP.ButtonController({dataSource:a,buttonContainer:e.one(".controls")}),e.one(".artist-chooser").delegate("change",function(e){var o=e.target,n=o.get("value");t(n,a),a.load()},"input")},renderNav:function(){var t=new e.BMP.Widget.DropdownNav;t.render(e.one("h1").empty())}}},"1.0",{requires:["base","bmp-button-controller","bmp-model-basic","bmp-plugins-toggle-buttons","bmp-widget-animated-number","bmp-widget-dropdown-nav","event","node","node-pluginhost"]});
YUI.add("bmp-widget-schooltowork-summary",function(e){var r={other:"work in a variety of other fields","null":"have not worked in the last five years",999:"are not in the labor force",1:"make a living as artists",2:"are educators",3:"work in service jobs",4:"work in sales and other office occupations",5:"work in various blue collar occupations",6:"are in the military",7:"work in farming, fishing, and forestry",10:"work in various professional fields",11:"are managers",12:"are working in business and finance",13:"now work in science, technology or engineering",14:"now work in medicine"},t=e.namespace("BMP.Widget").SchoolToWorkSummary=e.Base.create("SchoolToWorkSummary",e.Widget,[],{threshold:2e3,bindUI:function(){t.superclass.bindUI.apply(this,arguments);var e=this.get("dataSource");e.on("loaded",function(){this.syncUI()},this)},syncUI:function(){var e=this.get("dataSource"),r=e.get("dataState");if("loaded"===r){var t=e.get("data");this.get("contentBox").setHTML(this._generateText(this._prepareData(t)))}},_generateText:function(t){for(var a=[],n=0;n<t.length;n++){var i=t[n][1];if(1>i)break;var o=e.Number.format(i,{decimalPlaces:0,suffix:"%"}),s=o+" "+r[t[n][0]];1===Number(t[n][0])&&(s="<strong>"+s+"</strong>"),a.push(s)}var c="Of "+this.get("displayedFilterText")+", ";return e.Array.each(a,function(e,r,t){var a=r===t.length-1&&t.length>1;a&&(c+=" and "),c+=e,r!==t.length-1&&(c+=", ")}),c+"."},_prepareData:function(r){var t=this.threshold,a=e.Array.partition(r,function(e){return e[1]>=t}),n=e.Array.reduce(a.rejects,0,function(e,r){return e+r[1]}),i=e.Array.reduce(a.matches,0,function(e,r){return e+r[1]}),o=i+n,s=e.Array.map(a.matches,function(e){return 0===o?0:(e[1]=100*e[1]/o,e)});return s.push(["other",100*n/o]),s}},{CSS_PREFIX:"bmp-schooltowork-summary",ATTRS:{dataSource:{writeOnce:"initOnly",validator:function(r){return r instanceof e.BMP.Model.BasicModel}},displayedFilterText:{value:"people who reported this as their degree field",validator:e.Lang.isString}}})},"1.0",{requires:["array-extras","widget","datatype-number-format","base"]});
YUI.add("bmp-page-school-to-work",function(e){FOD1P_DEFINITONS={"-1":"All Art Fields",6e3:"Fine Arts",6001:"Drama And Theater Arts",6002:"Music",6003:"Visual And Performing Arts",6004:"Commercial Art And Graphic Design",6005:"Film Video And Photographic Arts",6006:"Art History And Criticism",6007:"Studio Arts"},CODES_DISPLAY_ORDER=[-1,6001,6002,6003,6004,6005,6006,6007],e.namespace("BMP.Page").SchoolToWork={initializePage:function(){var t=this._dataModel=new e.BMP.Model.BasicModel({endpoint:"/api/acs/custom/schooltowork"}),a=this._summaryDataModel=new e.BMP.Model.BasicModel({endpoint:"/api/acs",groupby:"occp_group",useDescriptions:!1,sort:!0});t.setFilter("fod1p",[6e3,6099],"between"),a.setFilter("fod1p",[6e3,6099],"between");var o=new e.BMP.Widget.DataSourcedChart({chartType:"Sankey",options:{height:2500,sankey:{iterations:100,node:{width:10}}},dataSource:t}),r=this._summaryWidget=new e.BMP.Widget.SchoolToWorkSummary({dataSource:a,displayedFilterText:"all people in NYC with an art degree"});o.on("select",function(){console.log("hey! It's a wonderful day, sankey select just worked")}),this.renderFilter(),t.load(),a.load(),o.render(e.one(".main-chart-wrapper").empty()),r.render(e.one(".summary-wrapper"))},renderFilter:function(){var t=e.one(".fod1p-filter-wrapper"),a=e.Node.create('<select name="fod1p-filter" class="form-control">');e.Array.each(CODES_DISPLAY_ORDER,function(t){var o=FOD1P_DEFINITONS[t];a.append(e.Lang.sub('<option value="{code}">{definiton}</option>',{code:t,definiton:o}))}),a.on("change",this._handleFilterChange,this),t.empty().append(a)},renderNav:function(){var t=new e.BMP.Widget.DropdownNav;t.render(e.one("h1").empty())},_handleFilterChange:function(e){var t=e.target.get("value");-1!=t?(this._summaryWidget.set("displayedFilterText","people who reported "+FOD1P_DEFINITONS[t]+" as their degree field"),this._dataModel.setFilter("fod1p",t,"eq"),this._summaryDataModel.setFilter("fod1p",t,"eq")):(this._summaryWidget.set("displayedFilterText","all people in NYC with an art degree"),this._dataModel.setFilter("fod1p",[6e3,6099],"between"),this._summaryDataModel.setFilter("fod1p",[6e3,6099],"between")),this._dataModel.load(),this._summaryDataModel.load()}}},"1.0",{requires:["bmp-widget-datasourced-chart","bmp-model-basic","bmp-data-preparer","node","bmp-widget-dropdown-nav","bmp-widget-schooltowork-summary"]});
YUI.add("bmp-widget-selfreport-list",function(e){var t=e.namespace("BMP.Widget").SelfReportList=e.Base.create("SelfReportListWidget",e.Widget,[],{TEMPLATE:'<ul class="report-list new-reports"></ul><ul class="report-list old-reports"></ul>',renderUI:function(){t.superclass.renderUI.apply(this,arguments),this.get("contentBox").append(this.TEMPLATE)},syncUI:function(){t.superclass.syncUI.apply(this,arguments);var r=this.get("contentBox"),s=r.one(".old-reports").empty();e.Array.each(this.get("originalReports"),function(e){s.append(this._renderReport(e))},this)},addReport:function(e){var t=this.get("contentBox").one(".new-reports");t.prepend(this._renderReport(e))},setOriginalReportList:function(e){this._set("originalReports",e),this.syncUI()},_renderReport:function(t){var r=e.Node.create("<li>");return r.setHTML(this._reportToString(t)),r},_reportToString:function(t){if(t.version&&1!=t.version)throw"unsupported report version";var r="I made "+t.project_description;return e.Lang.isString(t.space_type)&&(r+=" while renting a "+t.space_type),e.Lang.isValue(t.space_price_amount)&&(r+=" for","$0.00"===t.space_price_amount?r+=" free":(r+=" "+t.space_price_amount,e.Lang.isValue(t.space_price_unit)&&(r+=" per "+t.space_price_unit))),e.Lang.isValue(t.project_year)&&(r+=" in "+t.project_year),r+=".",e.Lang.isValue(t.space_size_ft)&&(r+=" The space is about "+t.space_size_ft+"ft&#x00B2;."),r}},{CSS_PREFIX:"bmp-selfreport-list",ATTRS:{originalReports:{required:!0,value:[]},newReports:{value:[]}}})},"1.0",{requires:["widget","node","base"]});
YUI.add("bmp-page-selfreport",function(e){var t=function(t){return!e.Lang.isValue(t)||""===t},a=function(t){return e.Lang.isString(t)&&(t=parseFloat(t)),3.28084*t};e.namespace("BMP.Page").SelfReport={initializePage:function(){e.all(".selfreport input[name=space_size_x], .selfreport input[name=space_size_y]").on("keyup",this.updateSquaredArea),e.all(".selfreport button.submit").after("tap",this.submitForm,null,this);var t=this._reportListWidget=new e.BMP.Widget.SelfReportList;t.render(e.one(".reports")),this._loadSelfReportList().then(function(e){t.setOriginalReportList(e)},function(e){console.log(e)})},submitForm:function(s){var r=s.target.ancestor("form");s.target.addClass("disabled");var i={};if(r.all("input, select").each(function(e){var a=e.get("value");t(a)||(i[e.get("name")]=e.get("value"))}),!t(i.space_size_unitless)&&!t(i.space_size_units))if("m"===i.space_size_units)i.space_size_ft=a(i.space_size_unitless);else{if("ft"!==i.space_size_units)throw"bad units";i.space_size_ft=i.space_size_unitless}e.Lang.isString(i.space_price_amount)&&0===i.space_price_amount.trim().indexOf("$")&&(i.space_price_amount=i.space_price_amount.trim().substr(1)),e.Data.post({url:"/api/selfreport/v1",data:i},this).then(e.bind(function(){e.all(".selfreport .error").removeClass("error"),e.one(".selfreport form").getDOMNode().reset(),s.target.removeClass("disabled"),e.Lang.isValue(i.space_price_amount)&&(i.space_price_amount="$"+i.space_price_amount),this._reportListWidget.addReport(i)},this),function(t){e.Lang.isObject(t.fields)?e.Object.each(t.fields,function(t,a){e.all(".selfreport input[name="+a+"]").addClass("error")}):alert("Something went wrong. We'll give it a look."),s.target.removeClass("disabled")})},updateSquaredArea:function(){var t=e.one(".selfreport input[name=space_size_unitless]"),a=e.one(".selfreport input[name=space_size_x]"),s=e.one(".selfreport input[name=space_size_y]"),r=a.get("value"),i=s.get("value");r&&i&&t.set("value",r*i)},renderNav:function(){var t=new e.BMP.Widget.DropdownNav;t.render(e.one("h1").empty())},_loadSelfReportList:function(){return e.Data.get({url:"/api/selfreport/v1"})}}},"1.0",{requires:["bmp-widget-selfreport-list","bmp-widget-dropdown-nav","event-tap","jsb-data-util","node","node-event-delegate"]});
YUI.add("bmp-page-artistclasses",function(e){e.namespace("BMP.Page").ArtistClasses={pieChartOptions:{height:300,legend:{position:"labeled"}},smallPieChartOptions:e.merge(this.pieChartOptions,{height:300,legend:{position:"bottom"},fontSize:8,pieSliceTextStyle:{fontSize:7}}),getPieChartOptions:function(){return e.DOM.winWidth()>480?this.pieChartOptions:this.smallPieChartOptions},initializePage:function(){this._renderOccupationClasses(),this._renderDegrees(),this._renderOccupations()},_renderOccupationClasses:function(){var t=new e.BMP.Widget.GChart({chartType:"PieChart",options:e.merge(this.getPieChartOptions(),{colors:["#6E5321","#211B11","#2C486E"]}),dataTable:STATIC_CHART_DATA.artistClasses});t.render(e.one(".section.occupation .classes-chart-wrapper").empty())},_renderOccupations:function(){var t=new e.BMP.Widget.GChart({chartType:"BarChart",options:{title:"Approximate Number of People in NYC in Each Creative Occupation",height:600,legend:{position:"none"},chartArea:{width:"60%",height:"90%",right:0,bottom:0},fontSize:10},dataTable:STATIC_CHART_DATA.allOccupations});t.render(e.one(".section.occupation .occp-chart-wrapper").empty())},_renderDegrees:function(){var t=new e.BMP.Widget.GChart({chartType:"PieChart",options:this.getPieChartOptions(),dataTable:STATIC_CHART_DATA.artDegrees});t.render(e.one(".section.degree .chart-wrapper").empty())}}},"1.0",{requires:["bmp-data-preparer","bmp-widget-gchart","node","dom-screen"]});
YUI.add("bmp-widget-animated-number",function(t){var e=t.namespace("BMP.Widget").AnimatedNumberChart=t.Base.create("AnimatedNumberChart",t.Widget,[],{_lastNumber:0,bindUI:function(){e.superclass.bindUI.apply(this,arguments);var t=this.get("dataSource");t.on("dataStateChange",function(){this.syncUI()},this)},syncUI:function(){var e=this.get("contentBox"),a=this.get("boundingBox"),i=this.get("dataSource"),n=i.get("dataState"),r=i.get("errors").length>0;if(a.toggleClass("loading","initial"===n||"loading"===n),a.toggleClass("load-failed","load-failed"===n),a.toggleClass("has-errors",r),"load-failed"===n||r)return void e.setHTML("&mdash;");if("loaded"===n){var s=i.get("data")[this.get("dataProperty")];if(!t.Lang.isNumber(s))throw"Can't draw the number animation because it's not a number!";this.setNumberInterpolated(s),this.setSize(s)}},setSize:function(t){var e=this.get("sizeEffect"),a=(e.sizeB-e.sizeA)/(e.valueB-e.valueA),i=e.sizeA-a*e.valueA,n=a*t+i;this.get("contentBox").setStyle("fontSize",""+n+"%")},setNumberInterpolated:function(e){var a=10,i=a*this.get("sizeEffect").duration,n=(e-this._lastNumber)/i,r=1e3/30,s=this.get("contentBox"),o=this.get("numberFormatConfig");if(e===this._lastNumber)return void s.set("text",t.Number.format(e,o));var u,d=t.bind(function(){this._lastNumber=e,s.set("text",t.Number.format(e,o)),window.clearInterval(u)},this),l=this._lastNumber,m=0,g=function(){0!==n&&(l+=n,s.set("text",t.Number.format(l,o)),m+=1,m>=i&&d())};u=window.setInterval(g,r)}},{CSS_PREFIX:"bmp-animated-number",ATTRS:{dataSource:{writeOnce:"initOnly",validator:function(e){return e instanceof t.BMP.Model.BasicModel}},dataProperty:{validator:t.Lang.isString},numberFormatConfig:{value:{},writeOnce:"initOnly"},sizeEffect:{value:{valueA:0,sizeA:100,valueB:100,sizeB:200,duration:1}}}})},"1.0",{requires:["widget","base","datatype-number-format"]});
