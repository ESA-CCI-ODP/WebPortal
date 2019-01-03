/**
 * peep/lang/strings - the generic string-substitution file for messages and menus
 * 
 * This is the calling point for the langification of PEEP. It uses the appropriate
 * language string substitution file according to the value in the lang query variable
 * provided by the URL. Default value is English (en).
 * 
 * There are one each of the strings.js and errors.js file in each of the lang 
 * sub-directories. They contain the actual string substitutions for the messages
 * and error messages used in the PEEP code.
 * 
 * land sub-directory names are lower case versions of the 2 or 3-letter abbreviations
 * of country names defined by ISO-3166.
 * 
 * Created: 13/06/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 13/06/2013  | K. Salt          | Initial Create
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013
 * 
 */

define([
          'dojo/_base/declare' 
        , 'dojo/promise/all'
        , 'dojo/_base/lang'
        , 'dojo/Deferred'
        , 'dojo/io-query'
        , 'dojo/_base/array'
        , 'peep/config/sysConfig'
        
      ]
, function(declare, all, lang, deferred, ioquery, array, sysConfig) {
    return declare(null, {
        _lang:            'en'
      , _langBaseDir:     'peep/lang/'
      , _langFallbackDir: 'peep/lang/en/'
      , _messages:        null
      , _errors:          null
      , _help:            null
      
      , constructor: function() {
          lang.mixin(this, sysConfig);
          var _queryString = window.location.search;
          var _query = {};
          if (_queryString) {
            _query = ioquery.queryToObject(_queryString.substring(1,_queryString.length));
          }
          var _lang = (_query.lang)?_query.lang.toLowerCase():'en';
          this._lang = (array.indexOf(this.languages, _lang) !== -1)?_lang:'en';
          this._langBaseDir     = this._langBaseDir+this._lang+'/';
      }
    
      /**
       * init() - Load the strings up
       * 
       * Originally we just loaded the relevant language files and hoped it
       * was going to work ... This broke ...
       * 
       * Sometimes the lang-specific messages may not be complete, so first
       * we load the English ones and then overload them with the localised
       * ones, then any ones which are missing will turn up as English.
       */
      , init:  function() {
          var _defObj = new deferred();
          var _this = this;
          var _baseMessageFile  = this._langFallbackDir+'strings';
          var _baseErrorFile    = this._langFallbackDir+'errors';
          var _localMessageFile = this._langBaseDir+'strings';
          var _localErrorFile   = this._langBaseDir+'errors';
          require ([_baseMessageFile, _baseErrorFile]
          , function(baseMessages, baseErrors, localMessages, localErrors) {
              _defObj.resolve([
                (_this._messages = baseMessages),
                (_this._errors   = baseErrors),
              ]);
            }
          );
          if (this._lang !== 'en') {
            // its in another language so overload the english ones with the local ones
            require ([_localMessageFile, _localErrorFile]
            , function(localMessages, localErrors) {
                _defObj.resolve([
                  lang.mixin(_this._messages.menus, localMessages.menus),
                  lang.mixin(_this._messages.messages, localMessages.messages),
                  lang.mixin(_this._errors, localErrors)
                ]);
              }
            );
          }
          return _defObj;
      }
           
      /**
       * the getter methods for the various categories of message
       */
      , getMenus:           function() { return this._messages.menus; }
      , getMessages:        function() { return this._messages.messages; }
      , getErrors:          function() { return this._errors; }
      , getLang:            function() { return this._lang; }
      , getLangFallbackDir: function() { return this._langFallbackDir; }
      , getLangBaseDir:     function() { return this._langBaseDir; }
    
    });
});
