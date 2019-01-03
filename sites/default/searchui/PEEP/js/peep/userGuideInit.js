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
 * 16/10/2013  | K. Salt          | Initial Create
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
   */
  // tidy up the widgets ... and get rid of the throbber once the DOM is rendered and parsed
    require(['dojo/domReady!'], function() { 
      parser.parse();
    });
  });
