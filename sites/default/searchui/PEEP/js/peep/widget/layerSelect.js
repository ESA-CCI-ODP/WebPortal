/**
 * The PEEP menu class. /peep/widget/layerSelect
 * 
 * Contains all the functionality of the layer selection menu.
 * form of a display widget based on the dijit/Tree object. 
 * 
 * Created: 22/04/2013
 * 
 * Update History
 * ==============
 * Date        | by               | Detail
 * ----------------------------------------------------------------
 * 22/04/2013  | K. Salt          | Initial Create
 * 08/05/2013  | K. Salt          | Added multi-server capability
 * 21/05/2013  | K. Salt          | v 0.1 stable and tested. V 0.11 commenced
 * 01/06/2013  | K. Salt          | Finalised. V 0.2 is at RC1
 * ----------------------------------------------------------------
 *  
 * @version: 0.2 (RC1)
 * @author: K. Salt
 * 
 * copyright: Telespazio-Vega, 2013 and University of Reading 2006-2012
 * 
 */

define(
  [ 
    'dojo/_base/declare'
  ,  'dojo/on'
  ,  'dojo/_base/lang'
  , 'dojo/promise/all'
  , 'dojo/Deferred'
  , 'dojo/topic'
  , 'dojo/dom'
  , 'peep/config/sysConfig'
  , 'peep/lang/strings'
  , 'peep/core/server'
  , 'dojo/store/Memory'
  , 'dojo/store/Observable'
  , 'dijit/tree/ObjectStoreModel'
  , 'dijit/Tree'
  ]
  
, function(declare, on, lang, all, deferred, topic, dom, sysConfig, strings, server, Store, Observable, Model, Tree) {
    return declare(null, {
      /**
       * The required setup parameters for the tree are available in a js 
       * object which is either loaded by peep/core/core when it is initialised
       * or provided by a calling routine which wants to set new ones.
       * 
       * Since we already know what needs to be know in order to build this tree
       * We are just making a convenient package to wrap and control the tree, 
       * it's data store and model, and provide the functionality to load it to 
       * a target div anywhere in the system.

       * 
       */
        
      // these values are actually provided by the sysConfig Object and forced in here by init.js
        mapServerURLs:    ['']              // where are you getting the data from (provided by sysConfig)
      , divIds: {
          selectTargetDiv:  'LayerSelector' // the dom object where we are going to put the select tree
      }
        
      // Place holders for the objects constructing the tree ....
      , _tempTreeData: null                 // the js data object containing the raw data as retrieved
      , _treeData: null                     // the actual js data object defining the tree
      , _store: null                        // this selector's data store
      , _model: null                        // this selector's tree data model
      , _tree:  null                        // the actual tree object to display
      , _visibleNode: null                  // the node currently visible in the viewport
      , _strings: new strings()             // the lang strings ...
      
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
        // don't do it all here because we may want to call init() from another
        // method .. e.g. If we get notified of a change by the server.
        var _this = this;
        this._strings.init().then(function(){_this.init();});
      }
    
    /**
     * init() - Initialise the select tree
     * 
     * It's done this way so we can actually rebuild the tree if the state changes 
     * (provision for future developments to include high volatility date sets)
     * 
     */
    , init: function() {
      var _this = this;
      // this is actually where it all happens :)
      // set up the configuration correctly
      lang.mixin(_this, sysConfig);
      _this._buildDataSet().then(
        function(result) {
          _this._model = new Model({
            store: _this._store
          , labelAttr: 'label'
          , query: {prime: 'layer'}
          , mayHaveChildren: function(object) {
            return this.store.mayHaveChildren(object);
          }
          });
          _this._tree = new Tree({
              id: 'layerSelectionTree'
            , model: _this._model
            , showRoot: false
            , persist: false
            , onClick: function(object, node, evt){
              if(this.model.mayHaveChildren(object)) {
                this._onExpandoClick({node: node});
              } else {
                topic.publish('/peep/map/layerSelected', {obj: object, treeNode: node} );
              }
            }
          }).placeAt(dom.byId(_this.divIds.selectTargetDiv)).startup();
          _this._buildContextMenu();
        }
      );
    }
    
    , _buildDataSet: function() {
      var _this = this;
      // set up the original deferred object indicating that this method has been completed
      var _defObj = new deferred();
      // set up the array to contain the individual deferred objects returned by the multiple
      // calls to the aync data retrieval method server.getMenu() inside the for loop
      var _promiseList = new Array();
      // OK - go fetch the json object(s) containing the select menu data from each server in the list
      _this._tempTreeData = {name: 'root', id: 'root', prime: 'root', label: 'root', children: new Array()};
      for (var i in _this.mapServerURLs) {
        // gather all the promises together ...
        var _url = _this.mapServerURLs[i];
        _promiseList[i] = server.getMenu(_url, {}).response.then(
          function(response) {
            var _data = lang.clone(response.data);
            _data.url = ((response.options.query.url)?response.options.query.url:'');
            _this._tempTreeData.children.push(lang.clone(_data));
          }
        , function(err) {
            topic.publish('/peep/system/error', 'e_menumeta_retrieve');
          }
        );
      }
      // only resolve the method's deferred object if the promises resulting
      // from the for loop are all complete.
      all(_promiseList).then(
        function(result){ 
          // well now you've got the raw data. go ahead and build the proper data structure
          _this._fixData(_this._tempTreeData).then(
            function(){ 
              // and once the structure is built - make a proper dojo datastore for it
              _defObj.resolve(
                _this._store = new Observable (
                  new Store(
                    {
                      data: _this._treeData
                    , idProperty: 'prime'        
                    , getChildren: function(object){
                        return this.query({parent: object[this.idProperty]});
                      }
                      , mayHaveChildren: function(object) {
                        return this.query({parent: object[this.idProperty]}).length > 0;
                      }
                      , getLabel: function(object){
                        return object.label;
                      }
                    }
                  )
                )
              );
            }
          );
        }
      );
      
      // send the promise back asynchronously
      return _defObj.promise;
    }
    
    /**
     * Set up the data object to satisfy the dojo tree requirements
     */
      , _fixData: function(data){
        var _this = this;
        data.prime = 'layer';
        _this._treeData = new Array();
        _this._treeData.push(lang.clone(data));
        delete _this._treeData[0].children;       
        var _defObj = new deferred();
        // add id's and parent properties to the js data object
        // and then return it in a dojo-friendly form.
        var _traverse = function(data, prime, newPrime, _url) {
          for (var i in data) {
            if (typeof(data[i])=='object') {
              if ( i !== 'children') {
                var _temp = lang.clone(data[i]);
                _temp.parent = prime;
                _temp.prime = newPrime = prime+'.'+i;
                _temp.url = (_temp.url !== undefined)?_temp.url:_url;
                _url = _temp.url;
                delete _temp.children;
                _this._treeData.push(_temp);
              } else {
                prime = newPrime;
              }
              //going on step down in the object tree!!
              _traverse(data[i], prime, newPrime, _url);
            }     
          }
          return true;
        };
        
        _defObj.resolve(_traverse(data, 'layer', 'layer')); 
        return _defObj.promise;
      }
      
    , _buildContextMenu:function() {
        var _this = this;
        require(['dijit/registry', 'dijit/Menu', 'dijit/MenuItem', 'dojo/topic', 'dojo/query!css2'], 
        function(registry, Menu, MenuItem, topic){
          var _labels = _this._strings.getMenus();
          var menu = new Menu({
              targetNodeIds: ['layerSelectionTree'],
              selector: '.dijitLeafActive'
          });
          menu.addChild(new MenuItem({
                      label: _labels.doNothing
                    , onClick: function(evt){
                      return false;
                    }
          }));
          menu.addChild(new MenuItem({
                      label: _labels.removeAllButThis
                    , onClick: function(evt){
                      var _nodeId = dijit.byNode(this.getParent().currentTarget).item.id;
                      topic.publish('/peep/dialog/layerMenuSelect', {action: 1, nodeId: _nodeId});
                    }
          }));
          menu.addChild(new MenuItem({
                      label: _labels.removeThisLayer
                    , onClick: function(evt){
                      var _nodeId = dijit.byNode(this.getParent().currentTarget).item.id;
                      topic.publish('/peep/dialog/layerMenuSelect', {action: 2, nodeId: _nodeId});
                    }
          }));
        });
      }
    
    /**
     * setMenuHilite() - indicates that a layer has been selected
     * 
     * For the moment we'll just switch it on, but in the future we'll need to handle
     * multiple situations so it may well end up as a toggle.
     * 
     */
      
    , setMenuHilite: function(treeNode, status) {
        var _off = (status == 'off');
        var _domNode = treeNode.domNode;
        if (_off && dojo.hasClass(_domNode, 'dijitLeafActive')) {
          dojo.removeClass(_domNode, 'dijitLeafActive');
        } else {
          dojo.addClass(_domNode, 'dijitLeafActive');
        }
      }
    
    /**
     * setCurrentLayerHilite() - indicates that a layer is currently on the top of the stack
     * 
     * It's the same as setMenuHilight but just lights up the one which is
     * visible in the viewport.
     * 
     */
      
    , setCurrentLayerHilite: function(treeNode) {
        var _domNode = null;
        // kill off any previous top layer hilight
        if (this._visibleNode !== null) {
          _domNode = this._visibleNode.domNode;
          dojo.removeClass(_domNode, 'dijitLeafVisibleLayer');
        }
        // set the new top layer
        _domNode = treeNode.domNode;
        dojo.addClass(_domNode, 'dijitLeafVisibleLayer');
        this._visibleNode = treeNode;
      }
    
  });  
});
