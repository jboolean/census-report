# hash from each js filename to array of other js filesnames it depends on
# css will be included automatically if name matches
DEPENDENCIES = {
 'page-rentburden' => ['widget-gchart', 'model-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer'],
 'widget-datasourced-chart' => ['model-basic',],
 'data-util' => [],
 'model-basic' => ['data-util'],
 'plugin-toggle-buttons' => [],
 'button-controller' => ['model-basic', 'data-preparer'],
 'data-preparer' => []
}