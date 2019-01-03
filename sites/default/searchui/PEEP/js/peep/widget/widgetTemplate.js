/**
 * The PEEP WidgetTemplate. /peep/widget/widgetTemplate
 * 
 * The starting point for any widget built in the PEEP/Codiva system
 *
 * When creating a new widget use this as your initial code template. It also
 * contains any information/comments I found useful to include for future devs
 * to follow in order to stay within the guidelines (there aren't many!!)
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
  , 'dojo/on'
  , 'dojo/_base/lang'
  , 'dojo/Deferred'
  , 'dojo/promise/all'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'dojo/dom-style'
  , 'dojo/dom-geometry'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  // the following 4 items are not required if the wihget is not templated 
  // if you remove them, remove reference to them in the parameters too
  , 'dijit/_WidgetBase'
  , 'dijit/_TemplatedMixin'
  , 'dojo/text!./templates/widgetName.html'

  ]
  
, function( declare, on, lang, deferred, all, topic, dom, style, geometry, sysConfig, core, server, strings,
            _WidgetBase, _TemplatedMixin, template) {
    
    declare('widgetName', [_WidgetBase, _TemplatedMixin, template], {
      
        template:             template      // the template read into the variable during the define process
      , otherProperty:        null          // and so the list goes on ...
      , _strings:             new strings()
      
      /**
       * constructor() - the initialization method.
       * 
       * Whilst it is OK to write code to set up the widget in the contructor()
       * method, it is best to keep this to a minimum, and put all the detail
       * into the init() method. I do this because in theory the constructor()
       * method is a system method and should not be called directly by the
       * application. Keeping the specific setup in init() means that public
       * access is provided in the event of an update, modification or reload 
       * being required.
       * 
       * Yes I know that in javascript this is a nicety, but I like to keep to
       * some sort of standard wherever I can just to keep things strict and
       * comprehensible
       * 
       */
      , constructor: function(params) {
          this.inherited(arguments);
          // set up the configuration correctly - you only need to merge the system properties at instantiation
          lang.mixin(this, sysConfig);
          // the rest is done by init()
          this._strings.init().then(function(){
            _this._messages = _this._strings.getMessages();
          });    
      }
      
      /**
       * selfDestruct() - does what it says on the tin ...
       * 
       * clean up all the widget's associated objects.This can be particularly
       * important in the case of a templated widget. After this method has 
       * been executed, the widget should, for all practical proposes, be an 
       * empty shell;
       *.
       */
      
      , selfDestruct: function(){
        
      }
      
      /**
       * init() - Initialise the widget
       * 
       * @see constructor()
       * 
       */
        
      , init: function(params) {

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
          this.init();
      }
      
      /**
       * _addEventListeners - Sets up the event handlers for the scaleBar object.
       * 
       * I always add this at the creation phase regardless of whether we will be adding subscritions
       * or listeners, just because it guarantees the end of the code template works OK 
       */
      , _addEventListeners: function(){
        return true;
      }

    });
  });
