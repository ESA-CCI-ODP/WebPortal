/**
 * The PEEP Help Widget. /peep/widget/helpDilog
 * 
 * Retrieve, format and display lang-specific help messages
 *
 * Help messages are loaded as data files from the peep/lang/xx/ directory
 * These files follow simple rules and are re-formatted into HTML as part
 * of the widget setup process.
 * 
 * The widget always exists in proto-form hidden in is own dialog window
 * and is brought to life with a single parameter - the name of the help
 * section to be displayed.
 * 
 * Help Data Formatting uses Markdown. Originally designed by John Gruber 
 * <http://daringfireball.net/projects/markdown/>
 * 
 * and this widget uses the Open Source Markdown Interpreter showdown.js
 * written by John Frazer <http://www.attacklab.net>
 * 
 * Created: 16/07/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 16/07/2013  | K. Salt          | Initial Create
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
  , 'dijit/registry'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/Dialog'
  , 'dojo/text!./templates/helpDialog.html'

  ]
  
, function( declare, lang, topic, dom, domClass, registry, sysConfig, core, server, strings, 
            Dialog, template) {
    
    return declare('helpDialog', [Dialog], {
      
      templateString:       template      // the template read into the variable during the define process

      // supporting data and objects
      , _strings:             new strings() // the lang strings ...
      , _messages:            {}
      , _subscriptions:       {}
      , _helpBaseDir:         'js/peep/lang/en/help'
      , _helpFallbackDir:     'js/peep/lang/en/help'
      // The attach point variables and their attach arguments
      , closeButton:          '.'
      , title:                '.'
      , HTMLContent:          '.'      
      , indexList:            '.' // the html built from the {lang}/helpList.js file        

      , _setCloseButtonAttr:  {node: 'closeButtonNode', type: 'attribute', attribute: 'title'}     
      , _setTitleAttr:        {node: 'titleNode',       type: 'innerHTML'}     
      , _setHTMLContentAttr:  {node: 'containerNode',   type: 'innerHTML'} 
      , _setIndexListAttr:    {node: 'indexNode',       type: 'innerHTML'} 
      

      // class-wide properties - DO NOT set these from your code.
      , baseClass:            'helpDialog'
     /**
     * constructor() - the initialization method.
     * 
     * This is a really simple setup - let init() and postCreate() do the work
     */
      , constructor: function() {
          this.inherited(arguments);
          // you only need to merge the system properties at instantiation. They don't change
          lang.mixin(this, sysConfig);
          this._addEventListeners();
          var _this = this;
          this._strings.init().then(function(){
            _this._messages         = _this._strings.getMessages();
            _this._helpBaseDir      = _this._strings.getLangBaseDir()+'help/';
            _this._helpFallbackDir  = _this._strings.getLangFallbackDir()+'help/';
            _this._lang             = _this._strings.getLang();
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
          var _indexFile = this._helpFallbackDir+'/helpList';
          var _localFile = this._helpBaseDir+'/helpList';
          require([_indexFile], function(pageMetaData){ _this._makeIndex(pageMetaData); });
          if (this._lang !== 'en') {
            require([_localFile], function(pageMetaData){ _this._makeIndex(pageMetaData); });
          }
          this.handler();
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
    }
    
    /**
     * _makeIndex() - Build an index from retrieved data 
     * 
     * @see init()
     * @param object - metadata retrieved from a require of the index information
     * 
     */
    
    , _makeIndex:  function(pageMetaData) {
        var _index = '';
        for(x in pageMetaData) {
          var _onClick = this.divIds.helpPopup+'.handler("'+pageMetaData[x].name+'")';
          _index += "<div class='helpIndexLine' onclick='"+_onClick+"'>";
          _index += pageMetaData[x].title;
          _index += "</div>";
        }
        this.set('indexList', _index);
        this.set('closeButton', this._messages.closeButton);
    }
      
    /**
     * handler() - Called when a menu item is chosen
     */
    
    , handler: function(arg) {
        var _this=this;
        arg = (arg)?arg:'index';
        var _fallbackFile = this.codeRoot+this._helpFallbackDir+arg+'.help';
        var _helpFile     = this.codeRoot+this._helpBaseDir+arg+'.help';
        core.getHTML(_fallbackFile).then(function(text){
          _this.set('HTMLContent', text);
        });
        if (this._lang !== 'en') {
          core.getHTML(_helpFile).then(function(text){
            _this.set('HTMLContent', text);
          });
        }
        this.show();
    }
        
    /**
     * youClicked() - Called when a user clicks on a hotspot in the quick-view help page
     */
    , youClicked: function(arg) {
        var _fallbackFile = this.codeRoot+this._helpFallbackDir+'/quick/'+arg+'.quick';
        var _helpFile     = this.codeRoot+this._helpBaseDir+'/quick/'+arg+'.quick';
        core.placeHTML(_fallbackFile, 'quickHint');
        if (this._lang !== 'en') {
          core.placeHTML(_helpFile, 'quickHint');          
        }
      }
            
    /**
     * _addEventListeners - Sets up the event handlers for the helpDialog object.
     * 
     * I always add this at the creation phase regardless of whether we will be adding subscriptions
     * or listeners, just because it guarantees the end of the code template works OK 
     */

    , _addEventListeners: function(){
        var _this = this;
        this._subscriptions.help = topic.subscribe('peep/system/help', function(arguments){_this.handler(arguments);});
      }

    });
});
