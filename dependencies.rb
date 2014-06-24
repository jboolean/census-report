# hash from each js filename to array of other js filesnames it depends on
# css will be included automatically if name matches
DEPENDENCIES = {
 'page-rentburden' => ['widget-datasourced-chart', 'model-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer', 'widget-dropdown-nav'],
  'page-poverty' => ['model-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer', 'widget-dropdown-nav'],
 'page-school-to-work' => ['widget-datasourced-chart', 'model-basic', 'data-preparer',
    'widget-dropdown-nav', 'widget-schooltowork-summary'],
 'page-selfreport' => ['data-util', 'widget-dropdown-nav', 'widget-selfreport-list'],
 'page-artistclasses' => ['model-basic', 'widget-dropdown-nav'],

 'widget-datasourced-chart' => ['model-basic', 'widget-gchart'],
 'widget-animated-number' => ['model-basic'],
 'widget-schooltowork-summary' => ['model-basic'],
 
 'data-util' => [],
 'model-basic' => ['data-util', 'data-preparer'],
 'plugin-toggle-buttons' => [],
 'button-controller' => ['model-basic', 'data-preparer'],
 'data-preparer' => []


 # 'thirdparty/bootstrap/modal' => ['thirdparty/jquery-1.11.1']
}