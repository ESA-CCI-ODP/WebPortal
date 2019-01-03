/**
 * peep/config/sysConfig - the system configuration file
 *
 * Initially a simple, editable, js object, but in time and if required
 * it can be turned into a full data fetcher to populate the local system
 * configuration variables.
 *
 * For the short to medium-term future it will remain as a plain file.
 *
 *
 * Created: 22/04/2013
 *
 * Update History
 * ==============
 * Date        | by               | Detail
 * 22/04/2013  | K. Salt          | Initial Create
 *
 * @version: 0.11
 * @author: K. Salt
 *
 * copyright: Telespazio-Vega, 2013
 *
 */

define(['peep/config/baseLayers']
, function(baseLayers) {
    // Yes I know this is heavy handed, but it works so I'm using it !!
    /**
     * Derived From
     * parseUri 1.2.1 - Function to thoroughly parse a URI
     * 
     * Splits a URI into all its component parts and deliver them as individual properties on
     * an anonymous object. Individual property names are:
     * 
     * source,protocol,authority,userInfo,user,password,host,port,relative, path,directory,file,query,anchor
     * 
     * properties may be empty if there is no equivalent in the URL string
     * 
     * (c) 2007 Steven Levithan <stevenlevithan.com>
     * MIT License
    */
    var o   = {
        strictMode: false,
        key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
        q:   {name:   "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
        parser: {
            strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
            loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
        }
    },
    m   = o.parser[o.strictMode ? "strict" : "loose"].exec(window.location.href),
    uri = {},
    i   = 14;

    while (i--) uri[o.key[i]] = m[i] || "";

    uri[o.q.name] = {};
    uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
      if ($1) uri[o.q.name][$1] = $2;
    });

    var sysConfig = {
          codeRoot:           uri.directory + 'js/' //PEEP/js/' // this comes before the relative location for loading basic html files etc.
        , thredds:			  'true' // is this implementation using THREDDS (true) or standalone ncWMS (false)
        , mapServerURLs:      ['']   // if THREDDS is false there should be a server url here or it uses localhost
        , mapBaseLayers:      baseLayers
        , mapDefaultBase:     'demis_wms'
        , centerCoordinates:  {lat: 0, long: 0} // where do you want the initial center of the viewport to be?
        , initialZoomLevel:   0                 // optional value. If set the map will zoom to that extent initially
        , menuIsAccordion:    true              // set to false if you are making separate divs for the above
                                                // this ensures that the code doesn't try to open a specific
                                                // accordion pane programatically if it isn't an accordion
        , scaleBarIsFloating: true              // the scale bar is separate from the main accordion menu - just
                                                // here to ensure the system doesn't try to open the accordion
                                                // pane in the options menu if it's elsewhere
        ,languages:           ['en', 'nl']      // this array indicates the languages available for the langification subsystem
        , divIds:   {                           // the actual ids of the divs which the various widgets should reside
                    // the main areas of the PEEP/Godiva space - First the layer and display options section
                      leftSideBar:          'leftSideBar'           // the expando pane around the accordion menu
                    , optionsMenu:          'optionsMenu'           // the Accordion container containing the following set
                    , optionsTitleTargetDiv:'leftSideBar'           // the location for the title of the following set
                    , selectTargetDiv:      'layerSelector'         // the ncWMS layer selection menu (the 'left hand menu')
                    , selectTitleTargetDiv: 'layerSelector'          // the ncWMS layer selection title location
                    , scaleTargetDiv:       'scaleContainer'        // the container for the scale bar in ncWMS maps
                    , scaleTitleTargetDiv:  'rightSideBar'          // the container for the scale bar title
                    , calTargetDiv:         'dateSelector'          // the container for the calendar and animation options
                    , calTitleTargetDiv:    'dateSelector'    // the container for the calendar and animation title
                    , miscTargetDiv:        'miscOptions'           // the container for the miscellaneous oddities
                    , miscTitleTargetDiv:   'miscOptions'           // the container for the miscellaneous options title

                    // Now the rest of the primary page layout
                    , mapTargetDiv:         'mapContainer'    // actually where the OpenLayers.Map object will reside
                    , mapOverlayDiv:        'mapOverlayDiv'   // Where animation/vector overlays are built prior to mapping them
                    , mapOverlay:           'mapOverlay'      // the actual animation/vector image generated and overlaid
                    , throbber:             'throbber'        // the progress indicator/wait arrow
                    , generalPopup:         'peepGeneralPopup'// the universal reusable popup window for info etc.
                    , helpPopup:            'peepHelpPopup'   // the universal reusable popup window for the help subSystem
                    , statusLayer:          'statusLayer'     // Where we put the id and label of the current layer
                    , statusTime:           'statusTime'      // Ditto for the time/date data for the current layer display
                    , statusLatLon:         'statusLatLon'    // Ditto for the Lat/Lon coordinates of the current cursor position
                    , loader:               'loader'          // the div with the initial loading message and throbber

                    // And the User Guide
                    , ugDiv:                'peepUserGuide'   // The main div and widget on the user guide free-standing page

                      // the following set are the various information points dotted around the Godiva2 Screen
                    , autoZoom:             'autoZoom'
                    , zoomOnSelect:         'zoomOnSelect'
                    , moreInfo:             'moreInfo'
                    , copyright:            'copyright'
                    , date:                 'date'
                    , time:                 'time'
                    , utc:                  'utc'
                    , panelText:            'panelText'
                    , tValues:              'tValues'
                    , setFrames:            'setFrames'
                    , animation:            'animation'
                    , animationResolution:  'animationResolution'
                    , hideAnimation:        'hideAnimation'
                    , testImage:            'testImage'
                    , screenshot:           'screenshot'
                    , paletteDiv:           'paletteDiv'
                    , permalink:            'permalink'
                    , screenshotMessage:    'screenshotMessage'
                    , screenshotImage:      'screenshotImage'

                    }
    };


     if (sysConfig.thredds) { 
    	// get the server directly from the query string of the URL
    	var winLoc = (window.top.location == window.location)?window.location:window.top.location;
    	var queryString = winLoc.search.split('?')[1];
    	if (queryString != null) {
    		var keyValPairs = queryString.split('&');
    		for (var i=0; i<keyValPairs.length; i++) {
    			var pair = keyValPairs[i].split('=');
    			if (pair.length > 1) {
    				var key = pair[0].toLowerCase();
    				if (key == 'server') {
    					sysConfig.mapServerURLs = [pair[1]];
    				}
    			}
    		}
    	}
    }

    return sysConfig;
});
