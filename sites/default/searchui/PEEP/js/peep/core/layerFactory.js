/**
 * The PEEP factory class for creating layer objects. /peep/core/layerFactory
 * 
 * Used by metaMap to handle decisions on which layer object to create
 * 
 * 
 * Usage:
 * 
 * require(['peep/core/layerFactory']);
 * 
 * 
 * 
 * Created: 14/04/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 12/04/2013  | K. Salt          | Initial Create
 * 01/06/2013  | K. Salt          | Basic functionality OK - v 0.11 commenced
 *  
 * @version: 0.11
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define( [
           'peep/core/core'
         , 'dojo/topic'
         ]
  , function(core, topic) {
    var _factory = {
        /**
         * The make function is the factory call to create a metaLayer
         * 
         * @param - object - nodeData - metadata representing the layer object to be created
         * @return - peep.widget.metaLayer object
         */
        make: function(node) {
          var _temp = null;
          node.url = (node.url)?node.url:'wms';
          switch(node.type) {
            case 'lat_lon':
              _temp = new OpenLayers.Layer.WMS1_1_1(node.name, node.url, node.layerData, node.options);
              break;
            case 'polar':
              _temp = new OpenLayers.Layer.polarLayer(node.name, node.url, node.layerData, node.options);
              break;
            case 'tiled':
            case 'untiled':
              _temp = new OpenLayers.Layer.WMS(node.name, node.url, node.layerData, node.options);
              break;
            default:
              topic.publish('/peep/system/error', 'E_BAD_LAYER_TYPE');
            return false;
          }
          _temp.events.register('loadstart', _temp, function() {core.showThrobber();});
          _temp.events.register('loadend',   _temp, function() {core.hideThrobber();});
          return _temp;
        }
    };
    return _factory;
  }
);
