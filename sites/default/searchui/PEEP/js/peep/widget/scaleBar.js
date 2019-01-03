/**
 * The PEEP ScaleBar Widget. /peep/widget/scaleBar
 * 
 * The entire contents of the Scale Bar accordion pane in the main display
 *
 * A templated widget driven by the HTML and CSS stored in the respective
 * widget/resources directories. It is an accumulation of the many original
 * Godiva2 scale elements, and serves as the entry point for all actions on
 * those elements. 
 * 
 * This is the API to the Scale Bar sub-system and as such, once finalised,
 * all public methods MYST remain unchanged in their names and parameter
 * lists. In this way application code should remain unbroken by upgrades
 * to OpenLayers and nvWMS or any PEEP/Godiva core upgrades
 * 
 * Created: 19/06/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 19/06/2013  | K. Salt          | Initial Create
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define(
  [ 
    'dojo/_base/declare'
  , 'dojo/_base/lang'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'dojo/dom-class'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/_WidgetBase'
  , 'dijit/_TemplatedMixin'
  , 'dojo/text!./templates/scaleBar.html'

  ]
  
, function( declare, lang, topic, dom, domClass, sysConfig, core, server, strings, 
            _WidgetBase, _TemplatedMixin, template) {
    
    return declare('scaleBar', [_WidgetBase, _TemplatedMixin], {
      
        templateString:       template      // the template read into the variable during the define process
      , _currentParams:       {             // all the values which go into making up the full scale-bar display area
                                colorBarName: ''    // the name of the current scale spectrum
                              , scaleMax:     0     // the maximum value of the data set
                              , scaleMin:     0     // the minimum value of the data set
                              , autoScale:    false // reset the scale to automatically use the true max/min for the viewport
                              , logScale:     false // Is the scale logarithmic or linear
                              , numColorBands:256   // how many scale divisions are there
                              , palettes:     []    // list of appropriate colorbar names for this scalebar
                              , zAxis:        null  // The details for the Z-axis selection widget.
                              }
      , _layer:               null          // the metaLayer which 'owns' this particular scale bar

      // supporting data
      , _strings:             new strings() // the lang strings ...
      , _messages:            {}
      , _subscriptions:       {}
      
      // class-wide properties - DO NOT set these from your code.

      , _currentZ:            null
      , baseClass:            'scaleBar'
      , barSrc:               'images/blank.png'
      , title:                'not loaded yet'
      , max:                  '0'
      , min:                  '0'
      , oneThird:             '0'
      , twoThirds:            '0'
      , autoScale:            false
      , autoSrc:              'images/blank.png'
      , logScale:             false
      , logSrc:               'images/blank.png'
      , showZaxis:            'zPickerHidden'
      , zLabel:               'Elevation'
      , zUnits:               'm'
      
      // attribute to widget/DOM element mappings - called by this.set("attributeName", value); ...
      , _setTitleAttr:        {node: 'headline',        type: 'innerHTML'}     
      , _setBarSrcAttr:       {node: 'colorBar',        type: 'attribute', attribute: 'src'}     
      , _setMaxAttr:          {node: 'scaleMax',        type: 'attribute', attribute: 'value'}     
      , _setMinAttr:          {node: 'scaleMin',        type: 'attribute', attribute: 'value'}     
      , _setOneThirdAttr:     {node: 'scaleOneThird',   type: 'innerHTML'}     
      , _setTwoThirdsAttr:    {node: 'scaleTwoThirds',  type: 'innerHTML'} 
      , _setAutoSrcAttr:      {node: 'autoScaleState',  type: 'attribute', attribute: 'src'}
      , _setLogSrcAttr:       {node: 'logScaleState',   type: 'attribute', attribute: 'src'}      
      , _setShowZaxisAttr:    {node: 'zPicker',         type: 'class'}
      , _setZLabelAttr:       {node: 'zLabel',          type: 'innerHTML'}
      , _setZUnitsAttr:       {node: 'zUnits',          type: 'innerHTML'}
      
    /**
     * constructor() - the initialization method.
     * 
     * This is a really simple setup - let init() and postCreate() do the work
     */
      , constructor: function(params){
          this.inherited(arguments);
       // you only need to merge the system properties at instantiation. They don't change
          lang.mixin(this, sysConfig);
          this._addEventListeners();
          this._layer = params.layer;
          this.id = this._layer.getId()+'_scaleBar';
          // put the params in the right place
          this._currentParams = params;
          var _this = this;
          this._strings.init().then(function(){
            _this._messages = _this._strings.getMessages();
             _this.title = _this._messages.units+': '+_this._layer.getUnits();
          });  
      }
    
      /**
       * init() - Initialise the widget
       * 
       * @see constructor()
       * 
       */
        
        , init: function() {
            this._makeZaxisChooser();
             // for the sake of brevity
            var _p = this._currentParams;
            var _max        = Number(_p.scaleMax);
            var _min        = Number(_p.scaleMin);      
            var _third      = Number((_max - _min) / 3);
            var _OneThird   = (_p.logscale?Math.exp(_min + _third):_min + _third);
            var _TwoThirds  = (_p.logscale?Math.exp(_min + 2 * _third):_min + 2 * _third);
            this.set('max', _max.toPrecision(5));
            this.set('min', _min.toPrecision(5));
            this.set('oneThird', _OneThird.toPrecision(5));
            this.set('twoThirds', _TwoThirds.toPrecision(5));
            this.set('autoSrc', 'images/SYS/generic/'+(this.autoScale?'on':'off')+'.png');
            this.set('logSrc', 'images/SYS/generic/'+(this.logScale?'on':'off')+'.png');
            var _temp = {name: this._currentParams.colorBarName, numColorBands: this._currentParams.numColorBands};
            this.set('barSrc', this.makePaletteURL(_temp));

        }
        
        
    /**
     * selfDestruct() - does what it says on the tin ...
     * 
     * clean up all the widget's associated objects.This can be particularly
     * important in the case of a templated widget. After this method has 
     * been executed, the widget should, for all practical purposes, be an 
     * empty shell;
     *.
     */

      , selfDestruct: function(){
          this.destroyRecursive();
      }
    
      
    /**
     * There are also a set of specific methods for templated widgets which are
     * related to the creation and rendering of the dom representation of the
     * widget. 
     */
    
    /**
     * postCreate() - Actions to execute once the DOM portion of the widget has been rendered
     * 
     */
    
    , postCreate: function(){
        this.inherited(arguments);
        // I think the initial create will be fine without interference.
        this.init();
    }
    
    /**
     * makePaletteURL() - constructs the url strings to use as src for the colorbar
     * 
     */

    , makePaletteURL: function(payload) {
        return this._layer.getServerURL() +  '?REQUEST=GetLegendGraphic' 
                                          +  '&LAYER=' + this._layer.getId()
                                          +  '&COLORBARONLY=true'
                                          +  '&WIDTH=1'
                                          +  '&HEIGHT= 256'
                                          +  '&NUMCOLORBANDS=' + payload.numColorBands
                                          +  '&PALETTE=' + payload.name;
   }
    
    /**
     * build the selection element in the scale bar to allow the user to
     * choose a Z-axis value (e.g. Depth, Elevation) for this layer to display.
     * 
     */
    , _makeZaxisChooser: function(){
 
        var _zAxis = this._currentParams.zAxis;
        if (_zAxis == null) {
          // hide the zAxis selector
          this.set('showZaxis', 'zPickerHidden');
        } else {
          var _zAxisLabel = this._getZAxisLabel(_zAxis);
          this.set('zLabel', _zAxisLabel);
          this.set('zUnits', _zAxis.units);
          this.set('showZaxis', 'zPickerVisible');
          // Populate the drop-down list of z values
          var _zValues = _zAxis.values;
          var _zDiff = this._layer.getZvalue();
          while (this.zSelector.options.length) {this.zSelector.options.remove(0);}
          for (var _j = 0; _j < _zValues.length; _j++) {
            var _zLabel = (_zAxisLabel == 'Depth')? (_zValues[_j] * -1) : _zValues[_j];
            var _zOption = new Option(_zLabel, _zValues[_j]);
            this.zSelector.options.add(_zOption);
            if (_zValues[_j] == _zDiff) {
              this.zSelector.options.selectedIndex = _j;
              this.zSelector.options.value = _zValues[_j];
            }
          }
          this._currentZ = _zValues[0];
        }
    }
    
    /** 
     * Gets the string to use as the z axis label
     * 
     */
    , _getZAxisLabel: function(zAxis){
        // Check for units of pressure: see http://cf-pcmdi.llnl.gov/documents/cf-conventions/1.4/cf-conventions.html#id2982284
        if (['Pa', 'hPa', 'bar', 'millibar', 'decibar', 'atmosphere', 'atm', 'pascal'].indexOf(zAxis.units) >= 0) {
            return 'Pressure';
        }
        // This will be a normal elevation (e.g. in metres).  Check to see if all
        // values are negative: if so we'll call this a depth axis
        var allNegative = true;
        var zVals = zAxis.values;
        for (var i = 0; i < zVals.length; i++) {
          if (zVals[i] >= 0) {
            allNegative = false;
            break;
          }
        }
        return allNegative ? 'Depth' : 'Height';
    }
    
    /**
     * Event triggered by a change in the zAxis selector value
     */
    , _zValueChanged: function(){
        // go tell the layer it needs to reload itself ...
        this._currentZ = this.zSelector.value;
        this._layer.setZvalue(this._currentZ);
    }

    , changeMinMax: function(min, max) {
        this._currentParams.scaleMax = max;
        this._currentParams.scaleMin = min;
        this.init();
    }
    
    /**
     * The event handlers called by mouse actions on the templated objects
     */
  
    , _toggleLogScale: function() {
        var _indicator = !this.logScale;
        if (_indicator && (this.min < 0)) {
          topic.publish('/peep/system/error', 'E_LOGSCALE_NEGATIVE');
        } else {
          this.setLogScale(_indicator);
          this._layer.zoomScale();
        }
    }
  
    , _toggleAutoScale: function() {
        this.setAutoScale(!this.autoScale);
        this._layer.zoomScale(); /// this is where it happens
    }
    
    , _revertClick: function() {
        this.setAutoScale(false);
        this._layer.revertMinMax();
        
    }
  
    , _doPalettePicker: function() { 
        topic.publish('peep/system/paletteSelect', this);       
    }
    
    /**
     * Listener function for the new palette selected event
     */
    , _setNewPalette: function(payload) {
        // Topic.publish is a broadcast event. We only want to do something if this is the active layer
        if (this._layer.isCurrentLayer()){
          // colorBarName, numColorBands
          this._currentParams.colorBarName = payload.name;
          this._currentParams.numColorBands = payload.numColorBands;
          this._layer.setPalette(payload);
          topic.publish('peep/system/closePalette');
        }
    }

    , _doMaxSelect: function() {
        this.setAutoScale(false);
        this._layer.setNewMax(this.scaleMax.value);
    }
    
    , _doMinSelect: function() {
        this.setAutoScale(false);
        this._layer.setNewMin(this.scaleMin.value);
    }

    /**
     * show() - makes this the visible scaleBar
     */
    
    , show: function(){
        domClass.remove(this.domNode, 'scaleBarHidden');
        if (this._currentParams.zAxis) {
          this.set('showZaxis', 'zPickerVisible');
        }
    }
    
    /**
     * hide() - Make this scale Bar invisible
     */
    
    , hide: function(){
        domClass.add(this.domNode, 'scaleBarHidden');
        this.set('showZaxis', 'zPickerHidden');
    }
    
    , setAutoScale: function(bool){
        this.set('autoScale', bool);
    }
    
    , setLogScale: function(bool){
        this.set('logScale', bool);
    }
    
    , getAutoScale: function(){
        return this.autoScale;
    }
    
    , getLogScale: function(){
        return this.logScale;
    }

    , getColorBands:  function() {
        return this._currentParams.numColorBands;
    }
    
    /**
     * _takeSnapshot() - Event handler for the snapshot onclick
     * 
     * Prepares the parameters and then kicks off the data dialog to build and display the image
     * 
     */
    , _takeSnapshot:  function(){
      core.showThrobber();
        var _bounds = this._layer.getExtent();
        var _urls = this._layer.getMapURLs(_bounds);
        var _params = {
              title: this._layer.getLayerString()
            , urlBG: _urls.baseLayer 
            , urlFG: _urls.layer  
            , urlPalette: this.colorBar.src           
            , upperValue: Number(this.max)      
            , twoThirds:  Number(this.twoThirds)
            , oneThird:   Number(this.oneThird) 
            , lowerValue: Number(this.min)      
            , latLon: this._layer.getProjection() == 'EPSG:4326'
            , time: this._layer.getCurrentTime()
        };
        // Add the elevation, time and units if this layer has them
        // again, the scaleBar can provide this directly
        if (this._currentZ !== null) {
            var _value = (this.zLabel != 'Depth')?this._currentZ:(this._currentZ * -1);
            _params.elevation = this.zLabel + ': ' +_value + ' ' + this.zUnits;
        }        
        var _units = this._layer.getUnits();
        if (_units) { _params.units = _units; }

        //so you have enough to fetch the appropriate URL by now ...
        server.getScreenshotLink(this._layer.getServerURL(), _params).response.then(
            function(response){
              _imgURL = response.data.screenshotUrl;
              topic.publish('peep/mapData/snapshot',  _imgURL);
              core.hideThrobber();
            }
            , function(err){
              topic.publish('peep/system/error', 'E_NO_SNAPSHOT');
            }
            );
        // and go tell the data dialog what to post ...
        //alert("this function isn't finished yet");
    }
    
    /**
     * _addEventListeners - Sets up the event handlers for the scaleBar object.
     * 
     * I always add this at the creation phase regardless of whether we will be adding subscritions
     * or listeners, just because it guarantees the end of the code template works OK 
     */

    , _addEventListeners: function(){
        var _this = this;
        this._subscriptions.palette = topic.subscribe('peep/system/paletteSelected', function(arguments){_this._setNewPalette(arguments);});
      }

    });
  });
