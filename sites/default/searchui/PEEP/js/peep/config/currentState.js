/**
 * peep/config/currentState - holds the current state of a layer
 * 
 * The currentState object replaced the original Godiva method of saving
 * and retrieving transient data from the contents of the divs in the 
 * display. This is no longer possible since we are aiming at a multi-
 * layer implementation of Godiva, so we need to be able to switch out
 * the state when the layers are switched.
 * 
 * This object also takes care of populating the actual data displays on
 * screen, as was the case in the old Godiva2 code. The locations of the
 * data are now parameter driven, their id's being provided by the
 * peep/config/sysConfig object.
 * 
 * Created: 07/06/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 07/06/2013  | K. Salt          | Initial Create
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013
 * 
*/

define([ 'dojo/_base/declare']
  
, function(declare) {
    return declare(null, {
      // Declare all the state variables
        scaleMax:             0
      , scaleMin:             0
      , scaleOneThird:        0
      , scaleTwoThirds:       0
      , scaleSpacing:         'linear'
      , autoScale:            false
      , lockScale:            'lock'
      , scaleSpacing:         'linear'
      , numColorBands:        256
      , layerPath:            ''
      , firstFrame:           ''
      , lastFrame:            ''
      , units:                ''
      , zValues:              null
      , zAxis:                ''
      , zAxisLabel:           ''
      , zAxisUnits:           ''
      , autoZoom:             ''
      , zoomOnSelect:         true
      , moreInfo:             ''
      , copyright:            ''
      , date:                 ''
      , time:                 ''
      , utc:                  ''
      , tValues:              null
      , animationResolution:  null
      , testImage:            ''
      , permalink:            ''
    });
  }
);
