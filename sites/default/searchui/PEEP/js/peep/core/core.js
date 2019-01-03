/**
 * The PEEP core class. /peep/core/peep
 * 
 * This is something like the old global context. It carries around
 * many of the functions and variables which might have originally
 * been declared globally in the bad old days. 
 * 
 * If you have a function which is used by many classes and you 
 * don't want to repeat it in each class definition, you have two 
 * choices .. 
 * 
 * The preferred solution is to create a new utility class 
 *   e.g. server.js (peep/core/server).
 *   
 * In the last resort, or for functions which are way too generic
 * such as parseUrl() then they end up here.
 * 
 * Usage:
 * 
 * require(['peep/core/peep'], function(core) {
 *   core.methodName(params);
 * }
 * 
 * Created: 28/03/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 *  28/03/2013 | K. Salt          | Initial Create
 *  24/05/2013 | K. Salt          | ParseUri() added
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define(
[   'dojo/has'
  , 'dojo/aspect'
  , 'dojo/_base/lang'
  , 'dojo/promise/all'
  , 'dojo/Deferred'
  , 'dojo/_base/lang'
  , 'dojo/topic'
  , 'dijit/registry'
  , 'dojo/dom'
  , 'dojo/dom-style'
  , 'dojo/dom-attr'
  , 'dojo/dom-construct'
  , 'dojo/dom-geometry'
  , 'dojo/window'
  , 'dojo/date'
  , 'dojo/date/stamp'
  , 'peep/config/sysConfig'
  , 'peep/lang/strings'

], function(has, aspect, lang, all, deferred, lang, topic, registry, dom, style, 
            domAttr, domConstr, domGeom, win, date, dateStamp, sysConfig, strings) {
    var core = {
        _strings: new strings()
      , _throbCount:  0
        
      /**
       * The constructor actually does ALL the work. The rest of the methods are 
       * here to support the construction. The tree only needs to be built once,
       * populated, and then displayed in the correct place. 
       * 
       * In the future, we may want to include dynamic updates using a push notify
       * triggering a reload and redisplay, but that's relatively trivial once we
       * have this.init() fully operational.
       */
      , constructor: function() {      
          lang.mixin(_this, sysConfig);
          var _this = this;
          this._strings.init().then(function(){_this.init();});
      }
      
      , init: function() {
          this.langBaseDir = this._strings.getLangBaseDir();
          this._addEventListeners();
      }
      
      /**
       * getIsoTValue() - format a date to ISO for passing as a parameter
       * 
       * Takes a Javascript Date object and turns it into the correct format for a URL
       * this dojo verison treats all of them as Zulu time .. handy eh ??
       * 
       * @param Date - the date to be converted
       * 
       */
      
      , getIsoTValue: function(date) {
          var options = {
              selector: "date",
              zulu: true
          };
          return dateStamp.toISOString(date, options);
      }        
    
      /**
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
       *  
       * @param str - The URI to be parsed
       * @returns {object} - The URI in its broken down form.
       */
      , parseUri: function(str) {
          var o   = {
              strictMode: false,
              key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
              q:   {name:   "queryKey", parser: /(?:^|&)([^&=]*)=?([^&]*)/g },
              parser: {
                  strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
                  loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*):?([^:@]*))?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
              }
          },
          m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
          uri = {},
          i   = 14;
        
          while (i--) uri[o.key[i]] = m[i] || "";
        
          uri[o.q.name] = {};
          uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
            if ($1) uri[o.q.name][$1] = $2;
          });
        
          return uri;
        }

    /**
     * openPopUp() - Opens the dialog box
     * 
     * @param boolean true = open it, false = close it
     * @param string - the url of the html fragment representing the contents of the popup
     * @param integer - the width of the dialog to expose
     * @param integer - the height of the dialog to expose
     * 
     */
    , popUp: function(action, url, width, height) {

        var _popup    = sysConfig.divIds.generalPopup;
        var _popupObj = registry.byId(_popup);
        var _open = (action == 'open');     
        style.set(_popup, { width:  ((width && _open)?width+'px':'auto')
                          , height: ((height && _open)?height+'px':'auto')});
        _popupObj.set('href', (url?url:''));
        if (_open) {
          _popupObj.show();
        } else {
          this.setPopUpContents('');
          _popupObj.hide(); 
        }
     }
    
    /**
     * setPopUpContents() - Used where an href isn't allowed (i.e. xref errors)
     * 
     * Often we need to acquire popup data from a server elsewhere. e.g. the
     * images generated form a transect on an external server. We can do that
     * by inserting html in place of the popup href.
     * 
     */
    , setPopUpContents: function(html) {
        var _popup    = sysConfig.divIds.generalPopup;
        var _popupObj = registry.byId(_popup);
        _popupObj.set('content', html);
    }
    
    /**
     * placeHTML() - puts the content of a file into a named div
     * 
     * Depending upon the third parameter the method will optionally
     * convert the incoming data from markdown to HTML before
     * inserting it into the div.
     * 
     */
    
    , placeHTML: function(file, div, relative){
        relative = relative?relative:'only';
        this.getHTML(file).then( function(text){
          domConstr.place(text, div, relative);
        });
    }

    , getHTML: function(file) {
        var _defObj = new deferred();
        require(['dojo/text!'+file], function(text){ 
          var _isMarkDown = (text.indexOf('<!--MD-->') !== false);
          if(_isMarkDown) {
            var _converter = new Showdown.converter();
            _defObj.resolve(_converter.makeHtml(text));
          } else {
            _defObj.resolve(text);
          }
        });
        return _defObj;
    }
    
    /**
     * showThrobber - Turn on the wait indicator (loading etc.)
     * 
     * Also handles multiple nested throbber calls. Just don't forget to turn it off !!
     */
    , showThrobber: function() {
      if (this._throbCount == 0) {
        style.set('throbber', 'visibility', 'visible');
      }
      this._throbCount++;
    }
    
    /**
     * hideThrobber - Turn on the wait indicator (loading etc.)
     * 
     * Also handles multiple nested throbber calls 
     * 
     */
    , hideThrobber: function() {
      this._throbCount--;
      if (this._throbCount < 1) {
        style.set('throbber', 'visibility', 'hidden');
        this._trhobCount = 0;
      }
    }
    
    /**
     * isEmpty() - tests to see if the provided object is empty
     * 
     * Convenience and readability method only ...
     * 
     * @param any data item - numbers/bools will never be empty.
     * 
     * @return boolean - true if the object or string is empty
     * 
     */
    , isEmpty: function(obj) {
        switch (typeof obj) {
        case 'object':
          return (Object.keys(obj).length === 0);
        case 'string':
          return (obj === '');
        case 'undefined':
        case 'null':
          return true;
        default:
          return false;
        }
    }
    
    , _addEventListeners: function() {
        topic.subscribe('peep/popup/center', lang.hitch(this, '_centerPopup'));
    }
    
  };
  return core;
});

