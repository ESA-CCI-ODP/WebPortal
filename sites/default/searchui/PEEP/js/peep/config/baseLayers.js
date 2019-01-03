/**
 * peep/config/baseLayers - defines the map base layer options for this installation
 * 
 * This file provides the base layer setup data as key=>value pairs. It is used by the
 * map object as initial setup data, and removes the previous dependency on literals 
 * within the code.
 * 
 * Each layer is set up differently, but the basic format is:
 * 
 * key: { name: string - name to display in the switcher,
 *        url:  string - url from which to retrieve the layer
 *        type: string - 'polar'|'lat_lon' - defines the layer type
 *        layerData: object - { layers: string - comma-separated list of layers to use,
 *                              format: string - OPTIONAL - image format string - e.g. 'image/jpeg'
 *                            }
 *        params: object - OPTIONAL {server/layer dependent additional options}
 *      }
 * 
 * Initially it is just a simple, editable, js object, but in time and if required
 * it could be turned into a full data fetcher driven from a database. This would
 * require a complete CRUD sub-system to handle data management. 
 * 
 * For the short to medium-term future it will remain as a plain file.
 * 
 * 
 * Created: 07/05/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 07/05/2013  | K. Salt          | Initial Create
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013
 * 
 */

define(
[ 'dojo/has'
, 'dojo/_base/lang'

], function(has, lang) {
  
    ///////////////////////////////////////////////////////////////////////////
    var baseLayers = {
    		// 

        demis_wms: 
        { name: 'Demis WMS'
        , url : 'http://www2.demis.nl/wms/wms.ashx?WMS=WorldMap'
        , type: 'lat_lon'
        , layerData:  { layers: 'Countries,Bathymetry,Topography,Hillshading,Coastlines,Builtup+areas,'+
                                'Waterbodies,Rivers,Streams,Railroads,Highways,Roads,Trails,Borders,Cities,Airports'
                      , format: 'image/png'
                      }
            }
        
      , bluemarble_demis_wms:
          { name: 'Demis BlueMarble'
          , url: 'http://www2.demis.nl/wms/wms.ashx?WMS=BlueMarble'
          , type: 'lat_lon'
          , layerData:  { 
                          layers: 'Earth Image,Borders,Coastlines' 
                        }
          }
      
      , bluemarble_wms:
          { name: 'Blue Marble + bathymetry'
          , url:  'http://wms-basemaps.appspot.com/wms'
          , type: 'lat_lon'
          , layerData:  { 
                          layers: 'bluemarble_file'
                        , format: 'image/jpeg'
                        }
          }
/*
 * This base layer consistently fails to load 
 * 
      , srtm_dem:
          { name: 'SRTM DEM'
          , url:  'http://iceds.ge.ucl.ac.uk/cgi-bin/icedswms?'
          , type: 'lat_lon'
          , layerData:  { 
                          layers: 'bluemarble,srtm30' 
                        }
          , options:    {
                          wrapDateLine: true
                        }
          }
 *
 * This base layer no longer exists
 * 
      , human_wms:
          { name: 'Human Footprint'
          , url:  'http://labs.metacarta.com/wms-c/Basic.py?'
          , type: 'lat_lon'
          , layerData:  {
                          layers: 'hfoot'
                        }
          }
*/
      , northPoleBaseLayer: 
          { name: 'North polar stereographic'
          , url:  'http://wms-basemaps.appspot.com/wms'
          , type: 'polar'
          , layerData:  {
                          layers: 'bluemarble_file'
                        , format: 'image/jpeg'
                        }
          , options:    {
                          wrapDateLine: false
                        , transitionEffect: 'resize'
                        , projection: 'EPSG:32661'
                        }
          }
     
      , southPoleBaseLayer:
          { name:  'South polar stereographic'
          , url: 'http://wms-basemaps.appspot.com/wms'
          , type: 'polar'
          , layerData:  {
                          layers: 'bluemarble_file'
                        , format: 'image/jpeg'
                        }
          , options:    {
                            wrapDateLine: false
                          , transitionEffect: 'resize'
                          , projection: 'EPSG:32761'
                        }
          }
      , ol_wms:
          { name:  'OpenLayers WMS'
          , url:  'http://labs.metacarta.com/wms-c/Basic.py?'
          , type: 'lat_lon'
          , layerData:  {
                          layers: 'basic'
                        }
          }
    };
    return baseLayers;
});

