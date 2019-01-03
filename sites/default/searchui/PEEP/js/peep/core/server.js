/**
 * The PEEP server class. /peep/core/server
 * 
 * Abstracts all the services used by the core application code in order to
 * communicate with the server. 
 * 
 * Usage:
 * 
 * require(['peep/core/server'], function(server) {
 *   server.methodName(params);
 * }
 * 
 * Created: 12/04/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 12/04/2013  | K. Salt          | Initial Create
 * 01/06/2013  | K. Salt          | v 0.1 stable and tested v 0.11 commenced
 *  
 * @version: 0.11
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define(
  [ 
   'dojo/has'
  ,'dojo/_base/lang'
  , 'dojo/request'
  ]
  
, function(has, lang, request) {
  var server = {

  /**
   * Function to handle xhrPost request submission and updating
   *
   * It's essentially a call to a server-side delivery script which returns a json array
   * in the form
   *
   * ['errors']=> is either single value False, or an array of error messages delivered
   * from the TALOSException object
   * ['something_else']  => the real data from the request. This format is determined by
   * the programmer writing the handler at each end.
   *
   * the input parameter 'data' can be of three formats ...
   *
   * 1) the name of the form being submitted
   * 2) a post string to be submitted
   * 3) a raw associative array or object representing the post data
   *
   * This function returns the result and deferred object back to the calling method.
   *
   * The responsibility for handling the returned response is split between this
   * definition, which handles the http header error types, and the calling location
   * which must define the 'load' handler elements including returned information
   * about non-fatal, server-side errors,
   *
   * @param string - destinationUrl is the URL to which the data is being submitted
   * @param string - handleAs - if set, the valid values are 'text' or 'json'
   * @param mixed -  data - see above ...
   * 
   * @return deferred_object - the returned data from the called server-side action.
   *
   **/
      
      dataRequest: function (destinationUrl, handleAs, method, data) {
        var ucMethod = method.toUpperCase();
        var queryParams = {
                            method: ucMethod
                          , handleAs: handleAs
                          , timeout: 60000
        };
        // the object isn't complete yet - you need to set up the posting parameters
        // is it a form, or a simple data post ?
        if (data) {
          if ((typeof(data) == 'object')) {
            // then it's a post attempt, but the data hasn't been postified yet ...
            queryParams.query = data.query;
            queryParams.data = data.data;
          } else {
            var form = false;
            require(["dojo/query", "dojo/NodeList-dom"], function(query){
              query("form").forEach(function(node){
                if (node.id == data) {
                  form = true;
                  // then its a form name not a post string ...set the form data property
                  require(["dojo/dom-form"], function(domForm) {
                    queryParams.data = domForm.toObject(node);
                  });
                };
              });
            });
            if (!form) {
              // then its a simple text string - it must be a query and/or  post query so ...
              queryParams.data = queryParams.query = data;
            };
          };
        }
        var url = 'wms';
        if (destinationUrl && destinationUrl !== 'wms') { url = queryParams.query.url = destinationUrl; }  
        var retVal = request(url, queryParams);
        return retVal; // this is a promise ...
      }
  
    , jsonRequest: function (url, params) {
        params.handleAs = 'json';
        params.timeout = 60000;
        var retVal = request(url, params);
        return retVal; // this is a promise ...
    }
        
  /**
   * Gets the skeleton hierarchy of layers that are offered by this server
   * @param node Root node to which this hierarchy will be added
   * @param params Object containing a callback that will be called when the result
   * is returned from the server and an optional menu argument that can be used to
   * load a specific menu structure.
   * 
   * @param node 
   * @param params
   * 
   */
  , getMenu: function(url, params) {
      var reqData = {
          query: {
            request: 'GetMetadata'
          , item: 'menu'
          , menu: typeof params.menu == 'undefined' ? '' : params.menu
          } 
        , data: {}
        };
      
      var retVal = this.dataRequest(url, 'json', 'GET', reqData);
      return retVal;
    }
  
 /**
  * Gets the details for the given displayable layer
  * @param Object containing parameters, which must include:
  *        layerName The unique ID for the displayable layer
  *        time The time that we're currently displaying on the web interface
  *        (the server calculates the nearest point on the t axis to this time).
  */
  , getLayerDetails: function(url, params) {
      var reqData = {
        query: {
          request: 'GetMetadata'
        , item: 'layerDetails'
        , layerName : params.layerName
        , time: params.time
        }
      , data: {}
    };
    var retVal = this.dataRequest(url, 'json', 'GET', reqData);
    return retVal;
  }
 

  /**
   * Gets the timesteps for the given displayable layer and the given day
   * @param Object containing parameters, which must include:
   *        callback the function to be called with the object that is returned
   *            from the call to the server (an array of times as strings)
   *        layerName The unique ID for the displayable layer
   *        day The day for which we will request the timesteps, in "yyyy-mm-dd"
   *            format
   */
  , getTimesteps: function(url, params) {
      var day = params.time.split('T');
      var time = day[0] + 'T00:00:00Z';
      var reqData = {
        query: {
          request: 'GetMetadata'
        , item: 'timesteps'
        , layerName: params.layerName
        // TODO: Hack! Use date only and adjust server-side logic
        , day: time
        }
    , data: {}
      };
      var retVal = this.dataRequest(url, 'json', 'GET', reqData);
      return retVal;
    }
  
  /**
   * Gets the min and max values of the layer for the given time, depth and
   * spatial extent (used by the auto-scale function).  ncWMS layers only.
   * @param Object containing parameters, which must include:
   *        callback the function to be called with the object that is returned
   *            from the call to the server (simple object with properties "min" and "max")
   *        layerName The unique ID for the displayable layer
   *        bbox Bounding box *string* (e.g. "-180,-90,180,90")
   *        crs CRS *String* (not a Projection object)
   *        elevation Elevation value
   *        time Time value
   */
  , getMinMax: function(url, params) {
      var reqData = {
          query: {
            request: 'GetMetadata'
          , item: 'minmax'
          , layers: params.layerName
          , bbox: params.bbox
          , elevation: params.elevation
          , time: params.time
          , srs: params.crs
          , width: 50 // Request only a small box to save extracting lots of data
          , height: 50
          , version: '1.1.1'
          }
        , data: {}
      };
      var retVal = this.dataRequest(url, 'json', 'GET', reqData);
      return retVal;
    }

  /**
   * Gets the list of animation timesteps from the given layer ncWMS layers only.
   * @param Object containing parameters, which must include:
   *        layerName The unique ID for the currently displayed layer
   *        start Start time for the animation in ISO8601
   *        start End time for the animation in ISO8601
   */
  , getAnimationTimeSteps: function(url, params) {
      var reqData = {
          query: {
            request: 'GetMetadata'
          , item: 'animationTimesteps'
          , layerName: params.layerName
          , start: params.start
          , end: params.end
          }
        , data: {}
      };
      var retVal = this.dataRequest(url, 'json', 'GET', reqData);
      return retVal;
    }

  /**
   * Gets the list of timesteps on a specified day for the given layer ncWMS layers only.
   * @param Object containing parameters, which must include:
   *        layerName The unique ID for the currently displayed layer
   *        day The date in ISO8601 of the selected day
   */
  , getTimeSteps: function(url, params) {
      var reqData = {
          query: {
            request: 'GetMetadata'
          , item: 'timesteps'
          , layerName: params.layerName
          , day: params.day
          }
        , data: {}
      };
      var retVal = this.dataRequest(url, 'json', 'GET', reqData);
      return retVal;
    }
    

  /**
   * Gets a link to a screen shot that is generated on the server
   */
  , getScreenshotLink: function(url, params) {
      // Add the common elements to the URL passed
      var queryParams =  {
                            method: 'POST'
                          , handleAs: 'json'
                          , timeout: 60000
                          , data: params
      };
      var retVal = request('screenshots/createScreenshot', queryParams);
      return retVal; // this is a promise ...
  }

  }; //END OF THE OBJECT DEFINITION ... NOW SEND IT BACK ...
  return server;
});
