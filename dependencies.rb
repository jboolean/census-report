# hash from each js filename to array of other js filesnames it depends on
# css will be included automatically if name matches
DEPENDENCIES = {
 'page-rentburden' => ['widget-gchart', 'models-basic', 
     'plugin-toggle-buttons', 'button-controller', 'data-preparer'],
 'widget-gchart' => ['models-basic',],
 'data-util' => [],
 'models-basic' => ['data-util'],
 'plugin-toggle-buttons' => [],
 'button-controller' => ['models-basic', 'data-preparer'],
 'data-preparer' => []
}