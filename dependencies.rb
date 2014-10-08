# hash from each js filename to array of other js filesnames it depends on
# css will be included automatically if name matches
DEPENDENCIES = {
 'page-main-nav' => [],
 'main-footer' => [],

 'page-rentburden' => ['widget-datasourced-chart', 'model-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer',
     'plugin-city-selector'],
  'page-poverty' => ['model-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer',
     'plugin-city-selector'],
 'page-school-to-work' => ['widget-datasourced-chart', 'model-basic',
    'widget-schooltowork-summary', 'widget-d3-sankey', 'data-preparer-d3-sankey'],
 'page-selfreport' => ['data-util', 'widget-selfreport-list'],
 'page-artistclasses' => ['widget-gchart'],

 'widget-datasourced-chart' => ['model-basic', 'widget-gchart', 'debounce'],
 'widget-animated-number' => ['model-basic'],
 'widget-schooltowork-summary' => ['model-basic'],
 'widget-selfreport-list' => ['selfreport-text-generators'],
 'widget-d3-sankey' => ['thirdparty/sankey'],
 
 'data-util' => [],
 'model-basic' => ['data-util', 'data-preparer'],
 'plugin-toggle-buttons' => [],
 'button-controller' => ['model-basic', 'data-preparer'],
 'data-preparer' => []


 # ' party/bootstrap/modal' => ['thirdparty/jquery-1.11.1']
}