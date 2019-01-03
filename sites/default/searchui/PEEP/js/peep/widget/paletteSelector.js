/**
 * The PEEP Pallette Colour Selection Widget. /peep/widget/paletteSelector
 * 
 * 
 * Created: 14/08/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 14/08/2013  | K. Salt          | Initial Create
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
  , 'dojo/on'
  , 'dojo/_base/lang'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'dojo/dom-construct'
  , 'dojo/dom-class'
  , 'dijit/registry'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/Dialog'
  , 'dojo/text!./templates/paletteSelector.html'

  ]
  
, function( declare, on, lang, topic, dom, domConstruct, domClass, registry, sysConfig, core, server, strings, 
            Dialog, template) {
    
    return declare('paletteSelector', [Dialog], {
      
      templateString:       template      // the template read into the variable during the define process

      // supporting data and objects
      , _strings:             new strings() // the lang strings ...
      , _messages:            {}
      , _subscriptions:       {}
      , _currentBands:        254   // current value for the scale granularity
      , _palettes:            []    // list of the names of all the available palettes
      , _colorBar:            null  // placeholder for a pointer to the current 'owner' of this object

      // The attach point variables and their attach arguments

      , palettes:             '<H2>Nothing Set Up Yet</bH2>' 
      , bands:                '254'

      , _setPalettesAttr:     {node: 'paletteBarNode',    type: 'innerHTML'}
      , _setBandsAttr:        {node: 'Bands',             type: 'attribute',  attribute:  'value'}
      

      // class-wide properties - DO NOT set these from your code.
      , baseClass:            'paletteSelector'
        
     /**
     * constructor() - the initialization method.
     * 
     * This is a really simple setup - let init() and postCreate() do the work
     */
      , constructor: function(params, layer) {
          this.inherited(arguments);
          // you only need to merge the system properties at instantiation. They don't change
          lang.mixin(this, sysConfig);
          this._addEventListeners();
          var _this = this;
          this._strings.init().then(function(){
            _this._messages     = _this._strings.getMessages();
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
        this.set('title', this._messages.paletteSelectionTitle);
    }
    
    , handler: function(colorBar) {
        // Set up the available PaletteBars display
        this._currentBands = colorBar.getColorBands();
        this._palettes = colorBar.palettes;
        this._colorBar = colorBar;
        this._redrawPaletteBars();
        this.show();
    }
    
    , _redrawPaletteBars: function() {
        // wipe out the old color bars
        this.set('palettes', '');
        // set up tthe new numColorBands granularity
        this.set('bands', this._currentBands.toString());
        // then go make the color bars for the user to select
        var _this = this;
        for (var _x=0; _x<this._palettes.length; _x++) {
          // create the image object
          var _imgObj = domConstruct.create('img', 
                                              { class: 'paletteSelectorBar'
                                              , src: _this._colorBar.makePaletteURL(
                                                  {
                                                    name: _this._palettes[_x] 
                                                  , numColorBands: this._currentBands
                                                  })
                                              , id:  _this._palettes[_x]
                                              });
         
          // add the event handler for the object click
          on(_imgObj, 'click', 
                      lang.hitch(topic, 
                                'publish', 
                                'peep/system/paletteSelected', 
                                {name: _this._palettes[_x], numColorBands: _this._currentBands}
                      )
          );
          // put the object into the correct slot in the widget
          domConstruct.place(_imgObj, this.paletteBarNode);
        }
      }
  
    , _changeBands: function() {
        this._currentBands = this.Bands.value;
        this._redrawPaletteBars();
    }
       
    /**
     * _addEventListeners - Sets up the event handlers for the helpDialog object.
     * 
     * I always add this at the creation phase regardless of whether we will be adding subscriptions
     * or listeners, just because it guarantees the end of the code template works OK 
     */

    , _addEventListeners: function(){
        var _this = this;
        this._subscriptions.popMe  = topic.subscribe('peep/system/paletteSelect', function(arguments){_this.handler(arguments);});
        this._subscriptions.shutMe = topic.subscribe('peep/system/closePalette',  function(){_this.hide();});
      }

    });
});
