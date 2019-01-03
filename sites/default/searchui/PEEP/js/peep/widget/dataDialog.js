/**
 * The PEEP data dialog Widget. /peep/widget/dataDialog
 * 
 * Format and display data with lang-specific titles etc.
 *
 * Waits for a topic, formats and displays the data contained in the payload.
 * 
 * Publishes topic events if/where actions are intitated froim within the display
 * (e.g. set minimum value to point value)
 * 
 * Created: 08/08/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 08/08/2013  | K. Salt          | Initial Create
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
  , 'dojo/dom-construct'
  , 'dojo/dom-class'
  , 'dojo/dom-style'
  , 'dojo/dom-geometry'
  , 'dojo/window'
  , 'dijit/registry'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/Dialog'
  , 'dojo/text!./templates/dataDialog.html'

  ]
  
, function( declare, lang, topic, dom, domConstruct, domClass, domStyle, domGeom, win, registry, sysConfig, core, server, strings, 
            Dialog, template) {
    
    return declare('dataDialog', [Dialog], {
      
      templateString:       template      // the template read into the variable during the define process

      // supporting data and objects
      , _strings:             new strings() // the lang strings ...
      , _messages:            {}
      , _subscriptions:       {}
      
      , _truncVal:            0 // actual data value returned by the point data URL
      
      , debugMode:            true  // just used to provide extra data in the dialog for the coders
      , _vHTML:               '' // temp storage for html used to display the vertical and
      , _tHTML:               '' // the time-sequence plots if relevant
        
      // The attach point variables and their attach arguments
      , closeButton:          '.'
      , title:                '.'
      , HTMLContent:          '.'     
      , seeVprompt:           'invisible'
      , seeTprompt:           'invisible'
      , seeMinMax:            'invisible'
      , minText:              'something'
      , maxText:              'something else'
      
      , _setCloseButtonAttr:  {node: 'closeButtonNode', type: 'attribute', attribute: 'title'}     
      , _setTitleAttr:        {node: 'titleNode',       type: 'innerHTML'}     
      , _setHTMLContentAttr:  {node: 'containerNode',   type: 'innerHTML'} 
      , _setSeeVpromptAttr:   {node: 'vProfileLinkNode',type: 'attribute', attribute: 'class'}
      , _setSeeTpromptAttr:   {node: 'tProfileLinkNode',type: 'attribute', attribute: 'class'}
      , _setSeeMinMaxAttr:    {node: 'minMaxLinkNode',  type: 'attribute', attribute: 'class'}
      , _setMaxTextAttr:      {node: 'setMaxNode',      type: 'innerHTML'}
      , _setMinTextAttr:      {node: 'setMinNode',      type: 'innerHTML'}
      

      // class-wide properties - DO NOT set these from your code.
      , baseClass:            'dataDialog'
     /**
     * constructor() - the initialization method.
     * 
     * This is a really simple setup - let init() and postCreate() do the work
     */
      , constructor: function() {
          this.inherited(arguments);
          lang.mixin(this, sysConfig);
          this._addEventListeners();
          var _this = this;
          this._strings.init().then(function(){
            _this._messages = _this._strings.getMessages();
            _this.init();
          });    
      }
    
    /**
     * init() - Initialise the widget
     * 
     * @see constructor()
     * 
     */
        
      , init: function() {
          var _this = this;
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
        this.set('closeButton', this._messages.closeButton);
    }
    
    /**
     * featureInfo() - Display the data retrieved by clicking on the visible layer
     */
    
    , _featureInfo: function(payload) {
      
        payload = (payload)?payload:this._featureInfoPayload;
        this._featureInfoPayload = payload;
        
        // We need a very rudimentary XML parser mechanism
        var getElementValue = function(xml, elName) {
          var el = xml.getElementsByTagName(elName);
          if (!el || !el[0] || !el[0].firstChild) return null;
          return el[0].firstChild.nodeValue;
        };
        
        this._cleanUp();
        
        // now let's get on with it
        var xmldoc = payload.pointData;
        var lon = parseFloat(getElementValue(xmldoc, 'longitude'));
        var lat = parseFloat(getElementValue(xmldoc, 'latitude'));
        var iIndex = parseInt(getElementValue(xmldoc, 'iIndex'));
        var jIndex = parseInt(getElementValue(xmldoc, 'jIndex'));
        var gridCentreLon = parseFloat(getElementValue(xmldoc, 'gridCentreLon'));
        var gridCentreLat = parseFloat(getElementValue(xmldoc, 'gridCentreLat'));
        var val = parseFloat(getElementValue(xmldoc, 'value'));
        var _html = '';
        this._vHTML = this._tHTML = '';
        
        if (lon) {
          // We have a successful result
          this._truncVal = val.toPrecision(4);
          _html += "<b>Lon:</b> " + lon.toFixed(6) + "<br /><b>Lat:</b> " +
          lat.toFixed(6) + "<br /><b>Value:</b> " + this._truncVal + "<br />";
          if (iIndex && this.debugMode) {
            // Add extra information about the grid
            _html += "<i>(Grid indices: i=" + iIndex + ", j=" + jIndex + ")</i><br />";
            _html += "<i>(Grid centre: lon=" + gridCentreLon.toFixed(6) + ", lat="+ gridCentreLat.toFixed(6) + ")</i><br />";
          }
          if (!isNaN(this._truncVal)) {
            this.set('minText', this._messages.setMinScale+this._truncVal);
            this.set('maxText', this._messages.setMaxScale+this._truncVal);
            this.set('seeMinMax', 'visible');
          }
          
          if (payload.zData) {
            this._vHTML += '<img src="' + payload.zData + '&POINT=' + lon + '%20' + lat + '" />';
            this.set('seeVprompt', 'visible');
          }
          
          if (payload.tData) {
            this._tHTML = '<img src="' + payload.tData + '" />';
            this.set('seeTprompt', 'visible');
          }
          this._showMe(_html);
        } else {
           topic.publish('peep/system/error', 'E_POINTNODATA');
        }
    }
    
    /**
     * click handlers for the template interactive elements
     */
    , _setMin: function(){ topic.publish('peep/system/setMin', this._truncVal); }
    
    , _setMax: function(){ topic.publish('peep/system/setMax', this._truncVal); }
    
    , _vProfilePupUp: function(){
        core.setPopUpContents(this._vHTML);
        core.popUp('open', '');
    }
    
    , _tProfilePupUp: function(){
        core.setPopUpContents(this._tHTML);
        core.popUp('open', '');
    }
    
    , _snapshot: function(src) {
        this._cleanUp(); 
        var _html = '';
        _html += "<p class='centerp'>"+this._messages.snapshotPopupText+"</p>";
        _html += "<img src='"+src+"' />";
        this.set('HTMLContent', _html);
        this._showMe(_html);
    }
    
    /**
     * If you do something more than once - write a method to do it !!
     */
    , _showMe: function(html) {

        this.set('HTMLContent' ,html);
        var _this = this;
        this.show().then(function(){
          var _winSize = win.getBox();
          var _divSize = domGeom.position(_this.domNode);
          domStyle.set(_this.domNode, {
                            top: Math.floor((_winSize.h - _divSize.h)/2)+"px"
                          , left:Math.floor((_winSize.w - _divSize.w)/2)+"px"
                      });
        });
    }
    
    /**
     * Whatever you have hanging around that is invisible in the window and outside the
     * primary data space ... make sure you turn them off here and call this method
     * at the initiation of any data display method.
     * 
     */
    , _cleanUp: function() {
        this.set('seeVprompt', 'invisible'); 
        this.set('seeTprompt', 'invisible'); 
        this.set('seeMinMax',  'invisible');
    }
    
    /**
     * _addEventListeners - Sets up the event handlers for the helpDialog object.
     * 
     * I always add this at the creation phase regardless of whether we will be adding subscriptions
     * or listeners, just because it guarantees the end of the code template works OK 
     */

    , _addEventListeners: function(){
        var _this = this;
        // you only need to merge the system properties at instantiation. They don't change
        this._subscriptions.featureInfo = topic.subscribe('peep/mapData/featureInfo', function(arguments){_this._featureInfo(arguments);});
        // this next line is just here to show you how you can extend this widget to handle different data types
        this._subscriptions.snapshot    = topic.subscribe('peep/mapData/snapshot',    function(arguments){_this._snapshot(arguments);});
      }

    });
});
