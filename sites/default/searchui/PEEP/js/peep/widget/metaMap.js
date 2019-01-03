/**
 * The PEEP menu class. /peep/widget/metaMap
 * 
 * Dojo/PEEP abstraction wrapper for an OpenLayers Map Object
 *
 * An abstracted API to allow Godiva/GMS programmers to communicate with all 
 * OpenLayers objects and methods in a version independent manner. Changes 
 * in OpenLayers should be accommodated at this level and the exposed API
 * should not change. Application code should remain unbroken by OpenLayers
 * upgrades
 * 
 * This is a fairly minimal object which contains all the high-level control
 * functionality for handing and manipulating a map. It also provides the 
 * entry point for handling the layers.
 * 
 * Created: 07/05/2013
 * 
 * Update History/Milestones
 * =========================
 * Date        | by               | Detail
 * 07/05/2013  | K. Salt          | Initial Create
 * 14/05/2013  | K. Salt          | Base Layer display and manage OK - v 0.11
 * 01/06/2013  | K. Salt          | Base layer handling passed off to metaLayer object - v 0.12
 * 04/06/2013  | K. Salt          | Data Layer Manipulation Begins - v 0.13
 *  
 * @version: 0.13
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define(
  [ 
    'dojo/_base/declare'
  , 'dojo/aspect'
  , 'dojo/on'
  , 'dojo/_base/lang'
  , 'dojo/promise/all'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'dojo/dom-style'
  , 'dojo/dom-geometry'
  , 'dijit/registry'
  , 'peep/lang/strings'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/widget/metaLayer'
  ]
  
, function( declare, aspect, on, lang, all, topic, dom, domStyle, domGeom, registry, 
            strings, sysConfig, core, server, metaLayer) {
    return declare(null, {
      /**
       * The required setup parameters for the map are available in a js object
       * which is either loaded by peep/core/core when it is initialised or 
       * provided by a calling routine which wants to set new ones.
       */
        
        _map:             null              // the actual OpenLayers Map object itself
      
      // these values are actually provided by the sysConfig Object and forced in here by init.js
      , mapServerURLs:  ['']                // where are you getting the data from (default: ['']
      , divIds: {
          mapTargetDiv: 'mapContainer'      // the dom object where we are going to put the select tree
      }
      , mapBaseLayers:  {}                  // the metadata defining the set of available base layers
      , mapDefaultBase: ''                  // the key of the default base layer to display
      , centerCoordinates: {lat: 0, long: 0}// the centre of the viewport on initial opening.
      , initialZoomLevel: 0                 // the zoom level to use when initalizing the map or changing the base layer
      
      // Place holders for the objects constructing the map ....
      , _mapSelector:     null              // the external PEEP map selector widget
      , _editingToolbar:  null              // the editing toolbar associated with the drawing layer
      , _layerSwitcher:   null              // the map's layer switching control
      , _panZoom:         null              // the map's pan and zoom control
      , _nav:             null              // the navigation bar
      , _navHistoryPanel: null              // the previous/last navigation control
      
      , _activeLayers:    {}                // the current list of data layers in use in this instantiation
      , _baseLayers:      {}                // the current list of base layers in use in this instantiation (can't be removed)
      
      // control data 
      , _subscriptions:   {}                // listener handles for the messaging system.
      , _projectionCode:  ''                // what projection is the map currently using.
      , _autoZoom:        true              // user configurable - zoom to layer extents on loading new layer
      // save/restore data - the items used to build the object defining the current scenario //
      , _layerBuildData:  {}                // the data defining the current active layers and their selection criteria
      , _currentBaseLayer:''                // the name of the currently active base layer (key to _baseLayers[])
      , _currentLayer:    ''                // the name of the currently active data layer (key to _activeLayers[])
      , _currentZoom:     null              // the zoom level of the current view
      , _currentCenter:   null              // the co-ordinates of the center of the view
      , _strings:         new strings()     // The langification data - all the string literals plus the language
      
      /////////////////////////////////////////////////////////////////////////////////////////

      /**
       * The constructor actually does nothing but call the init() method.
       * 
       * It's a convention I adopted to make sure that the map object can be 
       * re-initialised by a calling function without breaking the convention 
       * that a constructor method should only be called by the Dojo loader
       * on instantiation.
       * 
       */
    , constructor: function(selector) { 
        this._mapSelector = selector;
        // set up the configuration correctly
        lang.mixin(this, sysConfig); 
        this.init();
        this._aniLoad = on(dom.byId(this.divIds.mapOverlay), 'load', lang.hitch(this, '_placeAnimationLayer'));
      }
    
    /**
     * init() - Initialise the map container
     * 
     * It's done this way so we can actually re-initialise the map if the state
     * changes. This is in anticipation of needing a provision for possible high 
     * volatility date sets or the user electing to use a previously saved scenario.
     * 
     * (saved/restored scenarios are a whole new dimension for discussion)
     * 
     */
      
    , init: function() {
        // this is actually where it all happens :)
        // Stop the pink tiles appearing on error
        OpenLayers.Util.onImageLoadError = function() {
            this.style.display = "";
            this.src="./images/blank.png";
        };
        // build your base layers
        this._buildMapControls();
        this._addDrawingLayer();      
        // now instantiate the actual map object
        this._map = new OpenLayers.Map( this.divIds.mapTargetDiv, {
                          controls:[
                                     this._panZoom
                                   , this._nav
                                   , this._navHistoryPanel
                                   , this._layerSwitcher
                                   , this._editingToolbar
                                   ]
          , fractionalZoom: false
        });
        this._buildBaseLayers();
        this._editingToolbar.div.style.visibility = 'hidden';
        this._addEventListeners();
        this._setInitialZoomLevel();
        // and finally initialize the build data
        this._layerBuildData['language'] = this._strings.getLang();
        // attach the function to force a map sizing update in the event of a
        // container div resize.
        aspect.after(registry.byId(this.divIds.mapTargetDiv), 'resize', lang.hitch(this._map, 'updateSize'));
      }    
    
    , _setInitialZoomLevel: function() {
      var _divWidth = domGeom.getContentBox(dom.byId(this.divIds.mapTargetDiv)).w;
      var _maxZoomLevel = this._map.baseLayer.numZoomLevels;
      var _factor = this._map.baseLayer.tileSize.w;
      this._currentZoom = (this.initialZoomLevel)?this.initialZoomLevel:0;
      if (!(this._currentZoom)) {
        for (var _zoom=0; _zoom<_maxZoomLevel; _zoom++) {
          var _tw = _factor*(Math.pow(2, Math.pow(2, _zoom)));
          if (_divWidth < _tw){ 
            this._currentZoom = _zoom+1;
            break; 
          }
        }
      }
      this._map.setCenter(new OpenLayers.LonLat(this.centerCoordinates.long, this.centerCoordinates.lat), this._currentZoom);
      this._currentCenter = this.centerCoordinates;
    }
        
    , _buildMapControls: function() {
        // instantiate the map control objects
        this._panZoom = new OpenLayers.Control.PanZoom();
        this._nav = new OpenLayers.Control.NavigationHistory();
        this._navHistoryPanel = new OpenLayers.Control.Panel();
        this._navHistoryPanel.addControls([this._nav.next, this._nav.previous]);
        this._layerSwitcher = new OpenLayers.Control.LayerSwitcher(); 
      }
    
    , _buildBaseLayers: function() {
        for (var _layerName in this.mapBaseLayers) {
          var node = this.mapBaseLayers[_layerName];
          this._baseLayers[_layerName] = new metaLayer(node, {}, {}, this);

          this._map.addLayer(this._baseLayers[_layerName].layer);
          if (_layerName == this.mapDefaultBase) {
            this._currentBaseLayer = _layerName;
            this._map.setBaseLayer(this.mapDefaultBase);
            this._projectionCode = this._map.baseLayer.projection.getCode();
          }
        }
     }

    , _addDrawingLayer: function() {
        // Create a layer on which users can draw transects (i.e. lines on the map)
        var _temp = new OpenLayers.Layer.Vector( "Drawing" );
        _temp.displayInLayerSwitcher = false;
        var _this = this;
        var _featureAdded = function(event) {
          // Destroy previously-added line string
          if (_temp.features.length > 1) {
            _temp.destroyFeatures(_temp.features[0]);
          }
          // Get the linestring specification
          var line = event.feature.geometry.toString();
          // we strip off the "LINESTRING(" and the trailing ")"
          line = line.substring(11, line.length - 1);
          _this._activeLayers[_this._currentLayer].doTransect(line);
        };
        _temp.events.register('featureadded', _temp, _featureAdded);
        // Set up a control for drawing on the map
        // We use CSS to hide the controls we're not using
        this._editingToolbar = new OpenLayers.Control.EditingToolbar(_temp);
        this._baseLayers['EditingToolbar'] = {};
        this._baseLayers['EditingToolbar'].layer = _temp;
      }
    
    // Called when the user changes the base layer
    , _baseLayerChanged: function(event){
        var _this = this;
        // Change the parameters of the map based on the new base layer
        this._map.setOptions({
          maxExtent: this._map.baseLayer.maxExtent,
          maxResolution: this._map.baseLayer.maxResolution
        });
        for(var _layerName in _this._baseLayers) {
          if (_this._baseLayers[_layerName].layer.name == _this._map.baseLayer.name) {
            this._currentBaseLayer = _layerName;
            break;
          }
        }

        if (this._projectionCode != this._map.baseLayer.projection.getCode()) {
          // We've changed the projection of the base layer
          this._projectionCode = this._map.baseLayer.projection.getCode();
          this._map.setOptions({projection: this._projectionCode});
          this._setInitialZoomLevel();
        }
        if (this._currentLayer) {
          this._activeLayers[this._currentLayer].baseLayerChanged(this._map);
          var _bbox = this._layerBuildData[this._currentLayer].metaData.bbox;
          this._map.zoomToExtent(new OpenLayers.Bounds(_bbox[0], _bbox[1], _bbox[2], _bbox[3]));
        }
        
      }
        
    /**
     * _getFeatureInfo - Return the data specific to the point clicked
     * 
     * Triggered by a map.onClick event. Returns the specific data associated
     * with that particular point on the map.
     * 
     */
    
    , _getFeatureInfo: function(point) {
        if (this._currentLayer) {
          // find the exact point coordinates and ask the layer to do the work
          this._activeLayers[this._currentLayer].getFeatureInfo(point);
          return;
        }
      }
    
    /**
     * setCurrentZoom() - Sets the saved zoom level after a zoom event
     * 
     * the precursor methods 1 and 2 are there to filter out multiple invocations 
     * caused by the moveend event being triggered for both moves and zooms. It
     * still doesn't help with the resize issue on load for something like a 
     * North Sea map. When that's loaded the map has to zoom to the right scale
     * and move to the right location for optimum viewing. Nothing I can do about
     * it ... or at least ... nothing right now it's too fiddly.
     * 
     * @todo Revisit this one day, just for tidiness sake.
     * 
     */
    
    , setCurrentZoom1: function(event){
//      if(this._currentCenter != event.object.center) {
//        this.setCurrentZoom(event, 'move');
//      }      
    }
    
    , setCurrentZoom2: function(event){
      if(this._currentZoomLevel != event.object.zoom) {
        this.setCurrentZoom(event, 'zoom');
      }
    }
    
    , setCurrentZoom: function(event) {
        this._currentZoomLevel = event.object.zoom;
        this._currentCenter = event.object.center;
        if (this._currentLayer) {
          // we can't permit an animation to be carried across zoom levels so ...
          this._activeLayers[this._currentLayer].zoomScale();
        }
    }

    , getExtent: function() {
        return this._map.getExtent();
    }
    
    /**
     * _layerSeleced: Triggered by a message sent by the layer selector
     * 
     * Go off and fetch the meta data for the layer selected, and set up
     * the option menu:
     * 
     * - a) deactivate the layer. 
     * - b) remove all other layers
     * - c) do nothing
     * 
     * 1) If the layer has already been loaded then activate options a,b,c
     * 
     * If the layer doesn't yet exist or is inactive, create and activate
     * a metaLayer and then activate options b,c
     * 
     * @param object - node - layer selection metadata delivered as the 
     *                        message payload
     * 
     */
    , _layerSelected: function(obj) {
        this._editingToolbar.div.style.visibility = 'hidden';
        var _node = obj.obj;
        var _treeNode = obj.treeNode;
        if (_node.id) {
          var _this = this;
          if (!this._activeLayers[_node.id]) {
            core.showThrobber();
            // then it doesn't already exist so create it
            server.getLayerDetails(_node.url,{layerName: _node.id, time: core.getIsoTValue(new Date())}).response.then(
              function(response){
                // save raw data in case the user wants to save the current scenario for future use
                _this._layerBuildData[_node.id] = {node: _node, metaData: response.data, selectData: {} };
                // now go and build the metaLayer and its supporting tools (Calendar, ScaleBar etc.)                
                _this._activeLayers[_node.id] = new metaLayer(_node, response.data, _treeNode, _this);
                _this.addLayers(_node.id);
                if (_this._autoZoom) { 
                  var _bbox = response.data.bbox;
                  _this._map.zoomToExtent(new OpenLayers.Bounds(_bbox[0], _bbox[1], _bbox[2], _bbox[3]));
                }
                _this._promoteLayer(_node.id);
                core.hideThrobber();
              }
            , function(err) {
                topic.publish('/peep/system/error', 'E_LAYERMETA_RETRIEVE');
                core.hideThrobber();
              }
            );
          } else {
            // It already exists so just promote it to the top of the pile
            this._promoteLayer(_node.id);
          }
        }
      }
     
    /**
     * _activeLayerSelected() - Deals with the display options requested by the user
     * 
     * If a user right clicks on the name of a layer which is already live and active in the current view
     * there are 3 options open to him/her.
     * 
     * 0 - Ignore the action (i.e. oops)
     * 1 - Make this layer the only one on the map - discard all the others
     * 2 - Remove this layer and keep the others
     * 
     * @param object -  action: 0/1/2 representing the options above
     *                  nodeId: the node to do it to
     */
    , _activeLayerSelected: function(obj) {
        var _action = obj.action;
        var _nodeId = obj.nodeId;
        
        if (_action == 1) {
          // remove all other metaLayers and all their stuff (keep this one)
          for (var _layerName in this._activeLayers) {
            if (_layerName !== _nodeId) {
              this._destroyLayer(_layerName);
            }
          }
          this._promoteLayer(_nodeId);
          
        } else if (_action== 2) {
          this._destroyLayer(_nodeId);
          if (_nodeId == this._currentLayer) {
            // then you need to assign a new current layer
            for (var _layerName in this._activeLayers) {
              this._promoteLayer(_layerName);
              break;
            }
          }
        }
      }

    /**
     * _promoteLayer() - Push a layer to the top of the visible layers in the map
     * 
     */
    , _promoteLayer: function(nodeId) {
        for (var _layer in this._activeLayers) {
          this._activeLayers[_layer].hide();
          this._activeLayers[_layer].killAnimation();          
          if (_layer !== nodeId) {
            this._activeLayers[_layer].switchOffAllLayers();
          } else {
            this._activeLayers[_layer].setVisibleLayer();
          }
        }
        var _delta = (this._map.layers.length - 1) - (this._map.getLayerIndex(this._activeLayers[nodeId]._ncwms));
        this._map.raiseLayer(this._activeLayers[nodeId]._ncwms, _delta);
        this._activeLayers[nodeId].show();
        this._currentLayer = nodeId;
        if (this.menuIsAccordion && !(this.scaleBarIsFloating)) { // values from sysConfig mixed in on instantiation.
          registry.byId(this.divIds.optionsMenu).selectChild(this.divIds.scaleTargetDiv);
        } else if(registry.byId(this.divIds.scaleTitleTargetDiv).baseClass == "dijitExpandoPane") {
          // if it's a separate expando .. then expand it
          if (!(registry.byId(this.divIds.scaleTitleTargetDiv)._showing)) {
            registry.byId(this.divIds.scaleTitleTargetDiv).toggle();
          }
        }
        this._activeLayers[nodeId].zoomScale();
        this._activeLayers[nodeId].updateStatusBar(false);
        this.resetDrawingLayer();
      }
    
    /**
     * _destroyLayer() - totally obliterate a metaLayer and all its associated gubbins
     * 
     * Destroy the layer and remove its entry in any of the status/working arrays
     * 
     * @param string - the index key to the _activeLayers array
     */
    , _destroyLayer: function(nodeId) {
        var _this = this;
        // Tell the metaLayer object to clean up its messy stuff
        // every PEEP layer/layer-related object has a selfDestruct() method.
        this._activeLayers[nodeId].selfDestruct().then(
          function() {
            // Now tidy up this metaMap object of any PEEP/Godiva variables
            delete _this._layerBuildData[nodeId];
            // and finally get rid of the metaLayer itself ...
            delete _this._activeLayers[nodeId]; 
            var _scalePane = registry.byId(_this.divIds.scaleTitleTargetDiv);
            if (core.isEmpty(_this._activeLayers) && (_scalePane.baseClass == "dijitExpandoPane") && (_scalePane._showing)) {
              //then the scale bar was the last inside an open expando 
              // there's nothing left to see so close it
             _scalePane.toggle();
            }
          }
        );
      }
    
    /**
     * return the map projection of the current base layer
     */
    , getProjection: function() {
        return this._map.baseLayer.projection.projCode;
    }
    
    /**
     * return the id of the currently active layer
     */
    
    , getCurrentLayer: function() {
        return this._currentLayer;
    }
    
    , getBaseLayerURL:  function(bounds) {
        return this._map.baseLayer.getURL(bounds);
    }
    
    /**
     * Gets the size of the visible part of the map.
     * 
     * The dom doesn't return the same size for the visible map div c.f.
     * the Openlayers idea of the size, so this function will return the
     * OL size object direct from the map
     */
    , getMapSize: function() {
        return this._map.getCurrentSize();
    }
    
    /**
     * Gets the dom's idea of the position and size of the viewport
     */
    
    , getViewPortSize:  function() {
        var _node = dom.byId(this.divIds.mapTargetDiv);
        var _computedStyle = domStyle.getComputedStyle(_node);
        return domGeom.getMarginBox(_node, _computedStyle);
    }
    
    , getResolutions: function() {
        var _res = {  max:          this._map.baseLayer.maxResolution
                    , min:          this._map.baseLayer.minResolution
                    , resolutions:  this._map.baseLayer.resolutions
            };
        return _res;
    }
    /**
     * return the z-axis value of the current layer
     * 
     * This is only really here in case any non-layer related widget needs the info.
     * It will probably be deprecated, since I can't think of any non-layer related
     * item that would be remotely interested in a specific layer's z-axis value.
     * 
     */
    , getZvalue: function() {
        return this._activeLayers[this._currentLayer].getZvalue();
    }
        
    /**
     * addLayers() - add a new layer to the map
     *
     * inserts the tiled/untiled layer objects from the metaLayer into the current map
     * 
     * @param metaLayer - the object containing the new layers to be added
     */
    
    , addLayers: function(layerId) {
        var _temp = this._activeLayers[layerId];
        // is the current data item vector or scalar ??
        this._map.addLayers([_temp._tiled, _temp._untiled]);
        _temp.setVisibleLayer(false);
     }
    
    , addAnimation: function(layerId) {
        // is the current data item vector or scalar ??
        this._map.addLayers([this._activeLayers[layerId]._animation]);
        this._activeLayers[layerId].setVisibleLayer(true);   
    }
    
    , _placeAnimationLayer: function(){
        this._activeLayers[this._currentLayer].placeAnimationLayer();
    }
    /**
     * updateSelectData() - adds the current selection criteria set to the layer build data
     * 
     * Eventually this and the other data in _layerBuildData will be used to reconstruct
     * a previously saved scenario.
     * 
     *  @param string - the id of the layer being updated
     *  @param object - the selection criteria to be saved
     */
    
    , updateSelectData: function(id, selectData){ 
        this._layerBuildData[id].selectData = selectData;
    }
    
    /**
     * resetDrawingLayer() - Raise the focus of the editor drawing layer
     * 
     *  Used after layer switching layers to make sure the drawing layer part of the
     *  editor control is switched back to the top of the map and visible above the
     *  newly 'promoted' raster layer.
     *  
     */
    , resetDrawingLayer: function() {
      // this little run around is to make sure the drawing layer is pushed back on top
      // of the next layer ... otherwise you don't see the transect line being drawn
      var _activeControl = 0;
      for (var _x=0; _x<4; _x++) {
        if (this._editingToolbar.controls[_x].active) { _activeControl = _x; }
        this._editingToolbar.controls[_x].deactivate();
      }
      this._editingToolbar.controls[_activeControl].activate();
      this._editingToolbar.div.style.visibility = 'visible';
    }
        
    /**
     * _addEventListeners - Sets up the event handlers for the map object.
     * 
     * @todo - I might want to migrate some of these listeners over to the
     *         layer object etc. once I get deeper into the structure of the
     *         data mapping itself
     */
    , _addEventListeners: function(){
        var _this = this;
        this._subscriptions.layerSelected       = topic.subscribe('/peep/map/layerSelected',
            function(args) {_this._layerSelected(args);});
        this._subscriptions.layerMenuSelect     = topic.subscribe('/peep/dialog/layerMenuSelect',
            function(args) {_this._activeLayerSelected(args);});

        // make sure the projection etc. are right if we switch base layers
        this._map.events.register('changebaselayer', this, this._baseLayerChanged);
        // arrange for the feature detail retrieval
        this._map.events.register('click', this, this._getFeatureInfo);
        // Make sure the Google Earth and Permalink links are kept up to date when
        // the map is moved or zoomed
        this._map.events.register('moveend', this, this.setCurrentZoom1);
        this._map.events.register('zoomend', this, this.setCurrentZoom2);
  
        // pop the wait image up while a layer is loading
        this._map.events.register('preaddlayer', this._map, 
          function(evt) {
          // remember that in the context if this function, the variable 'this' 
          // refers to this._map .. not the metaMap object. _this refers to the metaMap
            if (evt.layer) {
              evt.layer.events.register('loadstart', this, function() {
                _this.layersLoading++;
                if (_this.layersLoading > 0) {
                  core.showThrobber();
                }
              });
              evt.layer.events.register('loadend', this, function() {
                if (_this.layersLoading > 0) {
                  _this.layersLoading--;
                }
                if (_this.layersLoading == 0) {
                  core.hideThrobber();
                }
              });
            }
          }
        );
        
        this._map.events.register("mousemove", this._map, 
          function(e) {
            var _pixel = new OpenLayers.Pixel(e.xy.x,e.xy.y);
            var _lonlat = this.getLonLatFromPixel(_pixel);
            var _lon = new Number(Math.abs(_lonlat.lon)).toPrecision(8)+((_lonlat.lon > 0)?" E":" W");
            var _lat = new Number(Math.abs(_lonlat.lat)).toPrecision(8)+((_lonlat.lat > 0)?" N":" S");
            dom.byId(_this.divIds.statusLatLon).innerHTML = _lat+' : '+_lon;
          }
        );
      }
    });
  }
);

