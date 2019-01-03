/**
 * init.js - The PEEP/Godiva3 Instantiator
 * 
 * Loads the base widget set required for the page to get started and
 * instantiates all the active widgets and objects which comprise the
 * user interface. 
 * 
 * Everything active is wrapped in a single callback, which is called 
 * when the basic building blocks are loaded.
 * 
 * All other activity is wrapped in the individual callbacks of the
 * action objects.
 * 
 * Created: 12/04/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 12/04/2013  | K. Salt          | Initial Create
 * 01/06/2013  | K. Salt          | v 0.1 stable and tested. v0.11 commenced
 *  
 * @version: 0.11
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013
 * 
 */

/*  The basic widget set. These are the essentially:
      1: DOM manipulation objects
      2: PEEP core objects
*/
require([
    'dojo/parser'
  , 'dojo/dom'
  , 'dojo/dom-style'
  , 'dijit/registry'
  , 'peep/config/sysConfig'
  , 'peep/lang/strings'
  , 'dojo/ready'
  ],
  
  function( parser, dom, domStyle, registry, sysConfig, strings, ready) {
  
  /**
   * EVERYTHING ... happens inside this callback. It is, effectively the event loop 
   * for the whole PEEP world. The first thing we need to do now is set up some local stuff
   * 
   * then we instantiate the  second-level objects (the ones which do all the work) and 
   * then drop the "loading" blanker div.
   */
  // tidy up the widgets ... and get rid of the throbber once the DOM is rendered and parsed
    require(['dojo/domReady!'], function() { 
      parser.parse();
      var _divIds = sysConfig.divIds;      
      var _strings = new strings();
      _strings.init().then(function(){
        var _messages = _strings.getMessages();
        domStyle.set(dom.byId(_divIds.loader), { visibility: 'hidden', width:  '0px', height: '0px' });
        var _x = new Array('select', 'scale', 'cal', 'misc');
        for (var _i in _x) {
          var _divId = _x[_i]+'TitleTargetDiv';
           dom.byId(_divIds[_divId]).title = _messages[_divId];
        }
        dom.byId(_divIds.statusLayer).innerHTML = _messages.noLayerSelected;
      });

      require([ 'peep/core/error', 'peep/widget/layerSelect', 'peep/widget/metaMap'], 
        function(error, select, metaMap) {
          var error = new error();
          var peepSelector  = new select();
          var peepMap       = new metaMap(peepSelector);
        }
      );
    });
  });
