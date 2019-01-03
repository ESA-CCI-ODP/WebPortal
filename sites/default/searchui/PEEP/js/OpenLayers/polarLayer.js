/**
 * Modifies the default OpenLayers WMS layer implementation by setting
 * extending the WMS1_1_1 layer type to be able to handle Polar 
 * projections efficiently.
 * 
 * Created: 14/04/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * 12/04/2013  | K. Salt          | Initial Create
 *  
 * @version: 0.1
 * @author: K. Salt
 * 
 * @see OpenLayers.Layer.WMS1_1_1
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 

 */

OpenLayers.Layer.polarLayer = OpenLayers.Class(OpenLayers.Layer.WMS, {
    
    /**
     * Constant: DEFAULT_PARAMS
     * {Object} Hashtable of default parameter key/value pairs 
     */
    DEFAULT_PARAMS: { service: "WMS",
                      version: "1.1.1",
                      request: "GetMap",
                      styles: "",
                      exceptions: "application/vnd.ogc.se_inimage",
                      format: "image/png"
                     }
    
    , wrapDateLine: true

    , srsKey: 'SRS' // Can be overridden by subclasses
      
    , CLASS_NAME: "OpenLayers.Layer.polarLayer"

    , initialize: function(name,url,params,options) {
      ///////////////////////////////////////////////////////////////////////////
      // The polar stereographic layers, one for each pole, are set up as
      // un-tiled layers because, for some reason, using tiled layers results 
      // in lots of spurious tiles being requested when switching from a lat-lon 
      // base layer to polar stereographic.
      //
      // The full extent of a polar stereographic projection is
      // (-10700000, -10700000, 14700000, 14700000)
      // but we don't use all of this range because we're only really interested
      // in the stuff near the poles.  Therefore we set maxExtent so that the 
      // user only sees a quarter of this range and maxResolution to restrict
      // the zoom level.
      ///////////////////////////////////////////////////////////////////////////
      
      var polarMaxExtent = new OpenLayers.Bounds(-10700000, -10700000, 14700000, 14700000);
      var halfSideLength = (polarMaxExtent.top - polarMaxExtent.bottom) / (4 * 2);
      var centre = ((polarMaxExtent.top - polarMaxExtent.bottom) / 2) + polarMaxExtent.bottom;
      var low = centre - halfSideLength;
      var high = centre + halfSideLength;
      var polarMaxResolution = (high - low) / 256;
      var windowLow = centre - 2 * halfSideLength;
      var windowHigh = centre + 2 * halfSideLength;
      var polarWindow = new OpenLayers.Bounds(windowLow, windowLow, windowHigh, windowHigh);

      options.maxExtent = polarWindow;
      options.maxResolution = polarMaxResolution;
      /**
       * 
       * the rest of this is a direct ripoff of the original WMS layer initialize() method .. 
       * since raw js inheritance is so shitty it was easier to do it this way right now
       *
       * @todo in the VERY near future I have to write a dojo factory to make layers.
       * 
       */
      
      var newArguments=[];
      params=OpenLayers.Util.upperCaseObject(params);
      if(parseFloat(params.VERSION)>=1.3&&!params.EXCEPTIONS){
        params.EXCEPTIONS="INIMAGE";
      }
      newArguments.push(name,url,params,options);
      OpenLayers.Layer.Grid.prototype.initialize.apply(this,newArguments);
      OpenLayers.Util.applyDefaults(this.params,OpenLayers.Util.upperCaseObject(this.DEFAULT_PARAMS));
      if(!this.noMagic&&this.params.TRANSPARENT&&this.params.TRANSPARENT.toString().toLowerCase()=="true"){
        if((options==null)||(!options.isBaseLayer)){
          this.isBaseLayer=false;
        }
        if(this.params.FORMAT=="image/jpeg"){
          this.params.FORMAT=OpenLayers.Util.alphaHack()?"image/gif":"image/png";}
      }
    }

    /*
     * Overrides function in superclass, preventing the loading of tiles outside
     * the latitude range [-90,90] in EPSG:4326
     */
    , getURL: function(bounds) {
        bounds = this.adjustBounds(bounds);
        if (this.isLatLon() && (bounds.bottom >= 90 || bounds.top <= -90)) {
            return "./images/blank.png"; // TODO: specific to this application
        }
        var imageSize = this.getImageSize();
        var newParams = {
            'BBOX': this.encodeBBOX ?  bounds.toBBOX() : bounds.toArray(),
            'WIDTH': imageSize.w,
            'HEIGHT': imageSize.h
        };
        return this.getFullRequestString(newParams);
    }
    
    /*
     * returns true if this layer is in lat-lon projection
     */
    , isLatLon: function() {
        return this.params[this.srsKey] == 'EPSG:4326' || this.params[this.srsKey] == 'CRS:84';
    }
    
    /*
     * Replaces superclass implementation, allowing for the fact that subclasses
     * might use different keys for the SRS= parameter
     */
    , getFullRequestString:function(newParams, altUrl) {
        var projectionCode = this.map.getProjection();
        this.params[this.srsKey] = (projectionCode == "none") ? null : projectionCode;
        return OpenLayers.Layer.Grid.prototype.getFullRequestString.apply(this, arguments);
    }
});
