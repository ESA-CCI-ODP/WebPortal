/**
 * The PEEP User Guide Widget. /peep/widget/uswrGuide
 * 
 * This works in an identical way to the helpDialog widget. The only real
 * difference id the fact that it is parented from dijit/layout/_LayoutWidget
 * rather than dijit/Dialog
 * 
 * @todo -  Make the langification more robust. System should fall back to the
 *          lang=en version if a file does not exist. See how it's done in the
 *          strings.js file for clarification.
 * 
 * 
 * 
 * Created: 16/10/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 16/10/2013  | K. Salt          | Initial Create
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
  , 'dojo/dom-attr'
  , 'dojo/dom-construct'
  , 'dijit/registry'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/layout/_LayoutWidget'
  , 'dijit/_WidgetsInTemplateMixin'
  , 'dijit/_TemplatedMixin'
  , 'dojo/text!./templates/printableUserGuide.html'

  ]
  
, function( declare, lang, topic, dom, domAttr, domConstruct, registry, sysConfig, core, server, strings, 
            _LayoutWidget, _WidgetsInTemplateMixin, _TemplatedMixin, template) {
    
    return declare('userGuide', [_LayoutWidget, _WidgetsInTemplateMixin, _TemplatedMixin], {
      
        templateString:       template      // the template read into the variable during the define process

      // supporting data and objects
      , _strings:             new strings() // the lang strings ...
      , _lang:                'en'
      , _messages:            {}
      , _subscriptions:       {}
      , _articles:            []
      , _helpBaseDir:         'peep/lang/en/help'
      , _helpFallbackDir:     'peep/lang/en/help'
      // The attach point variables and their attach arguments
      , titleString:          '.'
      , indexList:            '.' // the html built from the {lang}/helpList.js file        

      , _setIndexListAttr:    {node: 'indexNode',       type: 'innerHTML'}
      , _setTitleStringAttr:  {node: 'ugTitle',         type: 'innerHTML'}

      // class-wide properties - DO NOT set these from your code.
      , baseClass:            'userGuide'
        
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
          var _indexFile = this._helpFallbackDir+'/printableHelpList';
          var _localFile = this._helpBaseDir+'/printableHelpList';
          require([_indexFile], function(pageMetaData){ _this._makeGuide(pageMetaData); });
          if (this._lang !== 'en') {
            require([_localFile], function(pageMetaData){ _this._makeGuide(pageMetaData); });
          }
          this.MakeArticle('', 0);
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
    
    , _makeGuide:  function(pageMetaData) {
        var _index = '';
        var _domFrag = domConstruct.create('div');
        domConstruct.place(_domFrag, this.containerNode);
        for(x in pageMetaData) {
          var _innerDom = domConstruct.create('div');
          domAttr.set(_innerDom, 'id', pageMetaData[x].name+'Article');
          domAttr.set(_innerDom, 'class', 'ugArticle');
          domConstruct.place(_innerDom, _domFrag, 'last');
          _index += "<div class='helpIndexLine'>";
          _index += pageMetaData[x].title;
          _index += "</div>";
          // Count = 0 is already dealt with in the init function  ....
          this._makeArticle(pageMetaData[x].name);
        }
        this.set('indexList', _index);
        this.set('titleString', this._messages.ugTitle);
    }
      
    /**
     * handler() - Called when a menu item is chosen
     */
    
    , _makeArticle: function(name) {
        var _this=this;
        var _fallbackFile = this.codeRoot+this._helpFallbackDir+name+'.help';
        var _helpFile     = this.codeRoot+this._helpBaseDir+name+'.help';
        core.getHTML(_fallbackFile).then(function(text){
          domAttr.set(dom.byId(name+'Article'), 'innerHTML', text);
        });
        if (this._lang !== 'en') {
          core.getHTML(_helpFile).then(function(text){
            domAttr.set(dom.byId(name+'Article'), 'innerHTML', text);
          });
        }
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
     * _addEventListeners - Sets up the event handlers for the userGuide object.
     * 
     * I always add this at the creation phase regardless of whether we will be adding subscriptions
     * or listeners, just because it guarantees the end of the code template works OK 
     */

    , _addEventListeners: function(){}

    });
});
