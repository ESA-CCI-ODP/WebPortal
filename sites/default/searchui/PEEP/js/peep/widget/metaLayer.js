/**
 * The PEEP menu class. /peep/widget/metaLayer
 *
 * Dojo/PEEP abstraction wrapper for an OpenLayers Layer Object
 *
 * An abstracted API to allow Godiva/GMS programmers to communicate with all
 * OpenLayers Layer objects and methods, and Godiva Layer extensions, in a
 * version independent manner. Changes in OpenLayers or the lower-level
 * Godiva functionality should be accommodated at this level and the exposed
 * API should not change.
 *
 * Application code should remain unbroken by OpenLayers and Godiva upgrades
 *
 * This is a fairly minimal object which contains all the high-level control
 * functionality for handing and manipulating a Layer. It also provides the
 * entry point for handling the Godiva layer extensions and animations.
 *
 * Created: 07/05/2013
 *
 * Update History
 * ==============
 * Date        | by               | Detail
 * 29/05/2013  | K. Salt          | Initial Create
 * 01/06/2013  | K. Salt          | v 0.11 - Base layer creation handled at metaLayer level
 *
 * @version: 0.11
 * @author: K. Salt
 *
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 *
 */

define(
  [
    'dojo/_base/declare'
  , 'dojo/on'
  , 'dojo/_base/lang'
  , 'dojo/Deferred'
  , 'dojo/promise/all'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'dojo/dom-class'
  , 'dojo/dom-geometry'
  , 'peep/config/sysConfig'
  , 'peep/lang/strings'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/core/layerFactory'
  , 'peep/widget/scaleBar'
  , 'peep/widget/calendarBar'
  ]

, function( declare, on, lang, deferred, all, topic, dom, domClass, domGeom,
            sysConfig, strings, core, server, layerFactory, scaleBar, calendarBar) {

    return declare(null, {
      // Place holders for the objects constructing the layer ....
         layer:         null      // the layer data if this is a base layer ... otherwise use the ones below
      , _ncwms:         null      // the current active layer (a pointer to one of the following three layer objects)
      , _tiled:         null      // the actual OpenLayers layer object to be displayed as the tiled version
      , _untiled:       null      // ditto un-tiled version
      , _animation:     null      // the animation object associated with this dataSet (objType animator)

      // Supporting objects
      , _calBar:        null      // the date selection calendar associated with this dataSet (objType calBar)
      , _scaleBar:      null      // the scale bar associated with this dataSet (objType scaleBar)
      , _strings:       new strings()  // the messages etc. strings

      // layer creation parameters
      ,  id:            ''        // for convenience - the Layer ID extracted from the _nodeData
      , _layerMetaData: {}        // the metadata retrieved from the metaMap about the layer
      , _selectData:    null      // specific visible layer select criteria (timestamp, depth, etc.)
                                  // This is either provided if the layer is being reconstructed from saved
                                  // data or rewritten on the basis of an in-session selection, or by default
                                  // it is created using default values like the current date/time.
      , _nodeData:      null      // the data returned by clicking on a node in the layer select tree
      , _treeNode:      null      // This is the actual visible node in the layer select tree which was clicked
                                  // handy if we want to manipulate the display :)
      , _aniURL:        ''        // the URL of the current animation for this layer
      , _animating:     false     // are you currently showing an animation

      , _currentElevation:    0   // the currently selected z-axis position (if there is one)
      , _currentPalette:      ''  // Used to set/reset the palette in the scalebar
      , _currentNumColorBands:''  // Used to set/reset the number of scale divisions
      , _currentStyle:        ''  // just a convenient temporary store :)
      , _currentTime:         ''  // the date/time of the currently visible data
      , _layerString:         ''  // The layer information displayed in the top status bar
      , _zaxis:               []  // a convenient holdall for the z-axis levels

      // the parent metaMap object
      , _map:           null      // All metaObjects have a reference back to the metaMap object which
                                  // contains them in order for them to initiate high-level methods (objType metaMap)

      , _isNcWMS:       false     // is this an ncWMS (i.e. 4d) layer?
      , _latestBbox:    []        // the bounding box of the current viewport
      , _originalRange: []        // the max and min scale range for the entire data set

      , debug:          false     // developers for testing ...
      , _subscriptions: {}        // Placeholder for the publish/subscribe listener handles

      /**
       * constructor() - The constructor does nothing but call the init() method.
       *
       * It's a convention I adopted to make sure that the layer object can be
       * re-initialised by a calling function without breaking the convention
       * that a constructor method should only be called by the Dojo loader
       * on instantiation.
       *
       */
      , constructor: function(node, metaData, treeNode, map) {
          // set up the configuration correctly
          lang.mixin(this, sysConfig);
          this._nodeData = node;
          this._layerMetaData = metaData;
          this._treeNode = treeNode;
          this._map = map;
          this.id = node.id;
          this._addEventListeners();
          var _this = this;
          this._strings.init().then(function() {_this.init({});});
      }

      /**
       * init() - Initialise the select tree
       *
       * It's done this way so we can re-initialise the layer if the state changes
       * (provision for future developments to include high volatility data sets)
       *
       */

      , init: function(params) {
          this._isNcWMS = (typeof this._layerMetaData.units !== 'undefined');
          // and then build the real layers for display
          this._makeLayer(params);
        }

      /**
       * selfDestruct() - does what it says on the tin ...
       *
       * clean up all associated objects. Terminate your OpenLayers layers. Hand
       * back an empty shell;
       *
       */

      , selfDestruct: function(){
          var _defObj = new deferred();
          var _this = this;
          var _turnOff = function(){
            // turn off the menu highlight
            _this._map._mapSelector.setMenuHilite(_this._treeNode, 'off');
            // kill off the PEEP/Godiva variables
            _this._nodeData = null;
            _this._layerMetaData = null;
            _this._selectData = null;
            // ask the PEEP/Godiva widgets to do the decent thing
            if (_this._scaleBar) { _this._scaleBar.selfDestruct(); }
            if (_this._calBar)   { _this._calBar.selfDestruct();   }
            // then get rid of them
            _this._scaleBar = null;
            _this._calBar = null;
            // and then kill off any openLayers layers which exist
            _this.destroyLayers();
            _this.updateStatusBar(true);
            return true;
          };
          _defObj.resolve(_turnOff());
          return _defObj;
        }

      /**
       * _makeLayer() - Create the new layer
       *
       */
      , _makeLayer: function(params) {
          if (core.isEmpty(this._layerMetaData)) {
            //then it's a base layer so just return it
            this.layer = layerFactory.make(this._nodeData);
          } else {
            this._originalRange = this._layerMetaData.scaleRange;
            this._latestBbox = this._layerMetaData.bbox.join(',');
            // its a data layer so set up or update the selection criteria
            this._constructLayerParams(params);
            // now build the new layer
            wrapDateLine = (this.getProjection() == 'EPSG:4326');
            var _temp = {
                          name:       this._nodeData.label
                        , url:        this.getServerURL()
                        , layerData:  this._selectData
                        , type:       'tiled'
                        , options:    {
                                        buffer: 1
                                      , isBaseLayer: false
                                      , wrapDateLine: wrapDateLine
                                      }
            };
            // make the tiled layer
            this._tiled = layerFactory.make(_temp);
            // and the untiled layer
            _temp.type = 'untiled';
            _temp.options.ratio = 1.5;
            _temp.name = _temp.name.untiled;
            this._untiled = layerFactory.make(_temp);
            this.updateStatusBar(false);
            this._map._mapSelector.setMenuHilite(this._treeNode, 'on');
            if (this._isNcWMS) {
              // then we need to update the additional widgets
              this.buildScaleBar();
              this.buildCalBar();
            }
          }
      }

      /**
       * destroyLayers() - Wipe out the Openlayers.Layer objects
       *
       * Convenience method to remove all the currently displayed layers
       * from the map object. This may be because the metaLayer is self-
       * destructing or there has been a zoom/move whilst autoscale is
       * turned on, so we need to get rid of the old layers and replace
       * them with the new ones.
       *
       */
      , destroyLayers: function() {
          this._ncwms.destroy(); // we know that one must exist :) ...
          if (this._tiled) { this._tiled.destroy(); }
          if (this._untiled) { this._untiled.destroy(); }
      }

     , _rebuildLayers: function(parms) {
          // wipe out the old visualisation layers
          this.destroyLayers();
          // now  and set the new scale bar range and reload the re-coloured visualisation
          this.init(parms);
          // finally tell the map to replace the associated layers.
          this._map.addLayers(this.id);
          this._map.resetDrawingLayer();
          this.setVisibleLayer(this._animating);
      }

     /**
       * _constructLayerParms() - build a layer definition from the metadata
       *
       * ncWMS layers have date/time coordinates as well as spatial ones so
       * we have to select the correct date/time data to display before we can
       * actually produce any imaging.
       *
       * There is a lot more to it as well but most of this is ripped directly
       * from the original Godiva2.js and just tidied a little.
       *
       */

      , _constructLayerParams: function(params){
          if (core.isEmpty(params)) {
            // then it's a fresh load so lets's build the default select criteria
            if (typeof this._layerMetaData.zaxis != 'undefined') {
              this._zaxis = this._layerMetaData.zaxis;
              this._currentElevation = this._layerMetaData.zaxis.values[0];
            } else {
              this._currentElevation = 0;
            }
            this._currentStyle = (this._layerMetaData.supportedStyles == 'undefined')?'boxfill':this._layerMetaData.supportedStyles[0];
            this._currentPalette = (this._layerMetaData.defaultPalette)?this._layerMetaData.defaultPalette:'';
            this._currentNumColorBands = this._layerMetaData.numColorBands;
            this._currentTime = ((this._layerMetaData.nearestTimeIso)?this._layerMetaData.nearestTimeIso:(new Date().toISOString()));
            this._selectData = {
                                  layers:           this._nodeData.id
                                , elevation:        this._currentElevation
                                , styles:           this._currentStyle + (this._currentPalette?('/' + this._currentPalette):'')
                                , logscale:         this._layerMetaData.logScaling
                                , time:             this._currentTime
                                , colorscalerange:  this._layerMetaData.scaleRange[0]+','+this._layerMetaData.scaleRange[1]
                                , numcolorbands:    this._currentNumColorBands.toString()
                                , transparent:      true 
                                //, bgcolor:			'transparent'
            };
          } else {
            lang.mixin(this._selectData, params);
          }
          // now make sure the selection criteria are attached to the buildData element
          this._map.updateSelectData(this.id, this._selectData);
      }

      /**
       * baseLayerChanged() - Set layer parameters to match new base layer
       *
       * Called if the map object is instructed to change its base layer
       *
       */

      , baseLayerChanged: function(map) {
          this._tiled.maxExtent = map.baseLayer.maxExtent;
          this._tiled.maxResolution = map.baseLayer.maxResolution;
          this._tiled.minResolution = map.baseLayer.minResolution;
          this._tiled.resolutions = map.baseLayer.resolutions;
          this._tiled.wrapDateLine = (map.baseLayer.projection == 'EPSG:4326'); // We only wrap the dateline in EPSG:4326
          this._untiled.maxExtent = map.baseLayer.maxExtent;
          this._untiled.maxResolution = map.baseLayer.maxResolution;
          this._untiled.minResolution = map.baseLayer.minResolution;
          this._untiled.resolutions = map.baseLayer.resolutions;
          this._untiled.wrapDateLine = (map.baseLayer.projection == 'EPSG:4326'); // ditto
          }

      /**
       * setVisibleLayer() - Decides whether to display the animation, or the tiled or untiled version of the ncwms layer
       *
       * @param boolean - show animation true = yes
       */

      , setVisibleLayer: function(animation){
          var _style = this._selectData.styles;
          // first clear them all
          this.switchOffAllLayers();
          if (this._animation === null) { animation = false; }
          // now set the right one
          if (animation) {
            this.setLayerVisibility(this._animation, true);
          } else if (_style.toLowerCase() == 'vector') {
            this.setLayerVisibility(this._untiled, true);
            this._ncwms = this._untiled;
          } else {
            this.setLayerVisibility(this._tiled, true);
            this._ncwms = this._tiled;
          }
      }

      /**
       * switchOffAllLayers() - Hides all the layers associated with this metaLayer
       *
       * Useful when you're reloading a layer to avoid 'layer blinking' during the
       * data refresh cycle.
       *
       */
      ,switchOffAllLayers: function() {
        if (this._animation !== null) {
          this.setLayerVisibility(this._animation, false);
        }
        this.setLayerVisibility(this._tiled, false);
        this.setLayerVisibility(this._untiled, false);

      }

      /**
       * setLayerVisibility() -sets the visibility of the layer
       *
       * @param OpenLayers.Layer object
       * @param boolean is it visible or not?
       *
       */
      , setLayerVisibility: function(layer, visible) {
          if (layer != null) {
            layer.setVisibility(visible);
            // we don't want it in the layer switcher. We want it to remain permanently visible and
            // we'll do the raise/lower into/from view via left clicks on the Layer Selector Widget
            layer.displayInLayerSwitcher = false;
            // now switch up the scale bar and the date/time picker
          }
          this._map.resetDrawingLayer();
          if (visible) {
            this._map._mapSelector.setCurrentLayerHilite(this._treeNode);
          }
        }

      /**
       * updateStatusBar() - Adds status information to the bottom of the map
       */
      , updateStatusBar: function(wipe) {
          var _dateString = '';
          if (!wipe) {
            // then you're not deleting this layer, just updating it ...
            _dateString = new Date(this._selectData.time).toUTCString();
            this._layerString = this._nodeData.id+' - '+this._nodeData.label+' (Projection - '+this.getProjection()+')';
            dom.byId(this.divIds.statusTime).innerHTML  = _dateString;
            dom.byId(this.divIds.statusLayer).innerHTML = this._layerString;
          }
          // if not you're killing off this layer and those strings will be empty ...
          dom.byId(this.divIds.statusTime).innerHTML  = _dateString;
          dom.byId(this.divIds.statusLayer).innerHTML = this._layerString;
        }

      /**
       * buildScaleBar() - Configure the scaleBar object
       *
       * 1 - If the widget doesn't already exist - create it and populate it
       * 2 - Make sure this particular scaleBar is in the Scale Bar pane
       *

       */
      , buildScaleBar: function() {
          if (!this._scaleBar) {
          // the widget doesn't already exist - so create it
          var _params = {             // all the values which go into making up the full scale-bar display area
                          colorBarName: this._layerMetaData.defaultPalette  // used as the key to the image urls
                        , scaleMax:     this._layerMetaData.scaleRange[1]  // the maximum value of the data set
                        , scaleMin:     this._layerMetaData.scaleRange[0]   // the minimum value of the data set
                        , autoScale:    false  // reset the scale to automatically use the true max/min for the viewport
                        , logScale:     this._layerMetaData.logScaling // Is the scale logarithmic or linear
                        , numColorBands:this._layerMetaData.numColorBands   // how many scale divisions are there
                        , palettes:     this._layerMetaData.palettes        // list of appropriate palette names for this bar
                        , zAxis:        this._layerMetaData.zaxis
                        , layer:        this
                        };
          this._scaleBar = new scaleBar(_params).placeAt(this.divIds.scaleTargetDiv, 'first');
        } else {
          // Once the scaleBar has been set up, the only things that can actually change are the scale range values
          var _scaleRange = this.getCurrentMinMax();
          this._scaleBar.changeMinMax(_scaleRange[0], _scaleRange[1]);
        }
      }

      , buildCalBar: function() {
            if (!this._calBar && this._layerMetaData.datesWithData) {
            var _params = {
                            datesWithData:  this._layerMetaData.datesWithData
                          , timeAxisUnits:  this._layerMetaData.timeAxisUnits
                          , nearestTimeIso: this._layerMetaData.nearestTimeIso
                          , layer: this
            };
            this._calBar = new calendarBar(_params).placeAt(this.divIds.calTargetDiv, 'first');
          }
      }

      /**
       * Getters and setters ...
       */

      , getExtent: function() {
        return this._map.getExtent();
    }
      , getServerURL: function() {
          return this._nodeData.url?this._nodeData.url:'wms';
      }

      , getId: function() {
          return this._nodeData.id;
      }

      , getUnits: function(){
          return this._layerMetaData.units;
      }

      , getCurrentTime: function() {
          return this._currentTime;
      }

      , getProjection: function() {
          return this._map.getProjection();
      }

      , getLayerString: function() {
          return this._layerString;
      }

      , getMapURLs: function(bounds){
          var _thisURL = this._ncwms.getURL(bounds);
          var _baseURL = this._map.getBaseLayerURL(bounds);
          return {layer: _thisURL, baseLayer: _baseURL};
      }

      , isAnimating: function(){
          return this._animating;
      }

      , setNewMax: function(newMax) {
          newMax = Number(newMax);
          if (this.isCurrentLayer()) {
            var _scaleRange = this.getCurrentMinMax();
            if (newMax >= _scaleRange[0]) {
              _scaleRange[1] = newMax;
            } else {
              topic.publish('/peep/system/error', 'E_LAYERSETMAX');
            }
            this.setMinMax(_scaleRange[0], _scaleRange[1]);
          }
      }

      , setNewMin: function(newMin) {
          newMin = Number(newMin);
          if (this.isCurrentLayer()) {
            var _scaleRange = this.getCurrentMinMax();
            if (_scaleRange[1] >= newMin) {
              _scaleRange[0] = newMin;
            } else {
              topic.publish('/peep/system/error', 'E_LAYERSETMIN');
            }
            this.setMinMax(_scaleRange[0], _scaleRange[1]);
          }
      }

      , revertMinMax: function() {
          if (this.isCurrentLayer()) {
            this.setMinMax(this._originalRange[0], this._originalRange[1]);
          }
      }

      , getCurrentMinMax: function() {
      	  return this._selectData.colorscalerange.split(',');
      }

      , setZvalue: function(newZvalue) {
          this._currentElevation = newZvalue;
          this.zoomScale();
      }
      , getZvalue: function() {
        return this._currentElevation;
      }

      , setPalette: function(payload) {
          this._currentNumColorBands = payload.numColorBands;
          this._currentPalette       = payload.name;
          this.zoomScale();
      }

      , setNewTime: function(newTime) {
          this._currentTime = newTime;
          this.zoomScale();
      }

      /**
       * zoomScale() - Scale to zoomed values or revert
       */
      , zoomScale: function() {
          this._latestBbox = this.getExtent().toBBOX();
          if (!this._scaleBar.getAutoScale()) {
            // we are zooming a non-autoscaled map
            var _scaleRange = this.getCurrentMinMax();
            this.setMinMax(_scaleRange[0], _scaleRange[1]);
            this._scaleBar.init();
          } else {
            // its a new zoom with autoscaling set so get the new scale extents ...
            var _this=this;
            var params = {
                           layerName: this.id
                         , bbox:      this._latestBbox
                         , crs:       this.getProjection()
                         , elevation: this.getZvalue()
                         , time:      this._currentTime
                         };
            server.getMinMax(this.getServerURL(), params).response.then(
            function(response){
              _this.setMinMax(response.data.min, response.data.max);
            },
            function(err) {
              topic.publish('/peep/system/error', 'E_LAYERMINMAX_RETRIEVE');
              return false;
            }
          );
        }
      }

      , setMinMax:  function(min, max) {
          var _logScale = this._scaleBar.getLogScale();
          var _temp = { colorscalerange:  min+','+max
                      , logScale: _logScale
                      , elevation: this._currentElevation
                      , styles: (this._currentStyle + (this._currentPalette?('/' + this._currentPalette):''))
                      , numColorBands: this._currentNumColorBands.toString()
                      , time: this._currentTime
          };
          if (_logScale && (min<0)) {
            topic.publish('/peep/system/error', 'E_LOGSCALE_NEGATIVE');
            _temp.logScale = false;
          } else {
            this._rebuildLayers(_temp);
          }
      }

      /**
       * getFeatureInfo - Return the data specific to the point clicked
       *
       * Triggered by a map.onClick event. Returns the specific data associated
       * with that particular point on this layer
       *
       */

      , getFeatureInfo: function(e) {
          Event.stop(e);
          var _coords = this._map.getMapSize();
          var reqData = {
                          REQUEST: 'GetFeatureInfo'
                        , INFO_FORMAT: 'text/xml'
                        , X: e.xy.x
                        , Y: e.xy.y
                        , QUERY_LAYERS: this._ncwms.params.LAYERS
                        , WIDTH: _coords.w
                        , HEIGHT: _coords.h
                        , BBOX: this.getExtent().toBBOX() //this._latestBbox
          };
          var _svr = this.getServerURL();
          if (_svr != 'wms') {
            // This is the signal to the server to load the data from elsewhere
            reqData.url = _svr;
          }
          var _featureInfoUrl = this._ncwms.getFullRequestString(
              reqData,
              this.getServerURL()
          );
          var _zData = '';
          if (this._zaxis != null &&  this._zaxis.values != null && this._zaxis.values.length > 1) {
            // This layer has a vertical axis with > 1 values

            // Construct the URL of the vertical profile plot
            _zData += this.getServerURL() +
                     '?REQUEST=GetVerticalProfile' +
                     '&LAYER=' + this.id +
                     '&CRS=CRS:84' + // We frame the request in lon/lat coordinates
                     '&TIME=' + this._selectData.time +
                     '&FORMAT=image/png';
          }

         var _tData = '';
         if (this._calBar) {
           var _timeFrame = this._calBar.getTimeFrame();
           if (_timeFrame) {
           // you need to sort out this condition in the real thing ...
             var _serverAndParams = _featureInfoUrl.split('?');
             var _urlEls = _serverAndParams[1].split('&');
             // Replace the parameters as needed: we need to add the
             // time range and change the format to PNG
             _tData = this.getServerURL() + '?';
             for (var i = 0; i < _urlEls.length; i++) {
               if (_urlEls[i].startsWith('TIME=')) {
                 _tData += '&TIME=' + _timeFrame[0] + '/' + _timeFrame[1];
               } else if (_urlEls[i].startsWith('INFO_FORMAT')) {
                 _tData += '&INFO_FORMAT=image/png';
               } else {
                 _tData += '&' + _urlEls[i];
               }
             }
           }
         }

          OpenLayers.loadURL(_featureInfoUrl, '', this,
            function(response){
              var _payload = {pointData: response.responseXML, zData: _zData, tData: _tData};
              topic.publish('peep/mapData/featureInfo', _payload);
            },
            function(err) {
              topic.publish('/peep/system/error', 'E_POINTDATA_RETRIEVE');
              return false;
            }
          );
      }

      /**
       * Hiders and showers
       */

      // the main drivers for the hiders and showers
      , show: function() {
          core.popUp('close');
          this._showScaleBar();
          this._showCalBar();
      }

      // the main drivers for the hiders and showers
      , hide: function() {
          core.popUp('close');
          this._hideScaleBar();
          this._hideCalBar();
      }


      /**
       * showScaleBar() - Turn on this layer's scale bar
       */

      , _showScaleBar: function() {
          this._scaleBar.show();
      }

      /**
       * hideScaleBar() - Turn off this layer's scale bar
       */

      , _hideScaleBar: function() {
          this._scaleBar.hide();
      }

      /**
       * showCalBar() - Turn on this layer's calendar bar
       */

      , _showCalBar: function() {
          if (this._calBar){ this._calBar.show(); }
      }

      /**
       * hideCalBar() - Turn off this layer's calendar bar
       */

      , _hideCalBar: function() {
          if (this._calBar){ this._calBar.hide(); }
      }

      /**
       * is this layer the one currently in the viewport?
       */
      , isCurrentLayer: function() {;
          return (this._map.getCurrentLayer() == this.id);
      }

      /**
       * doTransect() - produce a dataset along a given transect
       *
       * Generally this method will be called from the drawing layer when the user
       * draws a line on the map using the drawing layer. The action initiates a
       * request for the server to provide a visualisation of the data points
       * along that line.
       *
       * @params string - The coordinate data of the start/end of the line
       */

      , doTransect: function(line) {
          // first make sure there is no currently visible popup
          core.popUp('close');
          // Load an image of the transect
          var _transectURL  = this.getServerURL();
              _transectURL += '?REQUEST=GetTransect';
              _transectURL += '&LAYER=' + this._nodeData.id;
              _transectURL += '&CRS=' + this.getProjection();
              _transectURL += '&ELEVATION=' + this.getZvalue();
              _transectURL += '&TIME=' + this._selectData.time;
              _transectURL += '&LINESTRING=' + line;
              _transectURL += '&FORMAT=image/png';
              // Styling parameters are needed if we create a vertical section plot
              _transectURL += '&COLORSCALERANGE=' + this._scaleBar._currentParams.scaleMin + ',' + this._scaleBar._currentParams.scaleMax;
              _transectURL += '&NUMCOLORBANDS=' + this._scaleBar._currentParams.numColorBands;
              _transectURL += '&LOGSCALE=' + this._scaleBar.getLogScale();
              _transectURL += '&PALETTE=' + this._scaleBar._currentParams.colorBarName;
              _transectURL += '&VERSION=1.1.1';
          core.setPopUpContents('<img src="'+_transectURL+'" />');
          core.popUp('open', '', 450, 350);
      }

      /**
       * buildAnimationLayer() - Controller for the animation display
       *
       * Creates a URL> to retrieve the animation, switches it on and activates the
       * "Stop Animation" button on the calendar bar.
       *
       * @param string - timestring is provided by the selection in the calendar bar
       */

      , buildAnimationLayer: function(){
          var _container = this._map.getMapSize();
          if ((_container.w > 1024) || (_container.h > 1024)) {
            this._calBar.showAniButton();
            // the animation suybroutyine in the server won't handle > 1 megapixel frames
            topic.publish('/peep/system/error', 'E_ANI_TOO_BIG');
          } else {
            core.showThrobber();
            var _overlay = dom.byId(this.divIds.mapOverlay);
            this._aniURL = '';
            // Get a URL for a WMS request that covers the current map extent
            var _urlEls = this._ncwms.getURL(this.getExtent()).split('&');
            // Replace the parameters as needed.
            this._aniURL = _urlEls[0];
            for (var i = 1; i < _urlEls.length; i++) {
              if (_urlEls[i].startsWith('TIME=')) {
                this._aniURL += '&TIME=' + this._calBar.getTimeString();
              } else if (_urlEls[i].startsWith('FORMAT')) {
                this._aniURL += '&FORMAT=image/gif';
              } else if (_urlEls[i].startsWith('WIDTH')) {
                this._aniURL += '&WIDTH=' + _container.w;
              } else if (_urlEls[i].startsWith('HEIGHT')) {
                this._aniURL += '&HEIGHT=' + _container.h;
              } else {
                this._aniURL += '&' + _urlEls[i];
              }
            }
            _overlay.src = this._aniURL;
          }
      }

      , killAnimation: function(){
          if (this._animation) {
            this._animation.destroy();
            this._calBar.hideToggleButton();
            this._animating = false;
            this._animation = null;
            this.setVisibleLayer(false);
          }
      }

      , placeAnimationLayer:  function() {
          var _ovSize = domGeom.position(dom.byId(this.divIds.mapOverlay));
          var _res = this._map.getResolutions();
          this._animation = new OpenLayers.Layer.Image(
                                            this._nodeData.label + "_animation", // Name for the layer
                                            this._aniURL, // URL to the image
                                            this.getExtent(), // Image bounds
                                            new OpenLayers.Size(_ovSize.w, _ovSize.h), // Size of image
                                            { // Other options
                                                isBaseLayer :   false,
                                                maxResolution:  _res.max,
                                                minResolution:  _res.min,
                                                resolutions:    _res.resolutions
                                            }
            );
          core.hideThrobber();
          this._map.addAnimation(this.id);
          this._animating = true;
          this._calBar.showToggleButton();

      }

      , toggleAnimation: function() {
          this._animating = !this._animating;
          this.setVisibleLayer(this._animating);
      }

      /**
       * _addEventListeners - Sets up the event handlers for the Layer object.
       */
      , _addEventListeners: function(){
          var _this = this;
          this._subscriptions.setMin  = topic.subscribe('peep/system/setMin',      function(arguments){ _this.setNewMin(arguments);});
          this._subscriptions.setMax  = topic.subscribe('peep/system/setMax',      function(arguments){ _this.setNewMax(arguments);});
          return true;
      }
    });
});

