/**
 * The PEEP Calendar Bar Widget. /peep/widget/calendarBar
 *
 * The entire contents of the Date/Time/Animation Selection pane in the menu
 *
 * Created: 17/08/2013
 *
 * Update History
 * ==============
 * Date        | by               | Detail
 * 17/08/2013  | K. Salt          | Initial Create
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
  , 'dojo/Deferred'
  , 'dojo/promise/all'
  , 'dojo/topic'
  , 'dojo/dom-class'
  , 'peep/config/sysConfig'
  , 'peep/core/core'
  , 'peep/core/server'
  , 'peep/lang/strings'
  , 'dijit/CalendarLite'
  , 'dijit/_WidgetBase'
  , 'dijit/_TemplatedMixin'
  , 'dojo/text!./templates/calendarBar.html'

  ]

, function( declare, lang, deferred, all, topic, domClass, sysConfig, core, server, strings, calendar,
            _WidgetBase, _TemplatedMixin, template) {

    return declare('calendarBar', [_WidgetBase, _TemplatedMixin], {

        _layer:               null          // the metaLayer which 'owns' this particular scale bar
      , templateString:       template      // the template read into the variable during the define process

      // supporting data
      , _strings:             new strings(sysConfig) // the lang strings ...
      , _calendar:            null
      , _datesWithData:       {}
      , _timeAxisUnits:       ''
      , _nearestTimeIso:      ''
      , _latestDateSelected:  ''
      , _latestTimeSelected:  ''
      , _animationTimeSteps:  []
      , _timeSteps:           []
      , _messages:            {}
      , _subscriptions:       {}

      // class-wide properties - DO NOT set these from your code.

      , baseClass:            'calendarBar'
      , title:                'not loaded yet'
      , showTime:             'timePickerHidden'
      , tTitle:               'blah blah'
      , tToolTip:             'More blah'
      , disableTime:          false
      , disableFrame:         false
      , firstTime:            false
      , firstTimeShow:        'tHidden'
      , lastTime:             false
      , lastTimeShow:         'tHidden'
      , animateShow:          'tHidden'
      , toggleShow:           'tHidden'

      // attribute to widget/DOM element mappings - called by this.set("attributeName", value); ...
      , _setTitleAttr:          {node: 'headline',        type: 'innerHTML'}
      , _setShowTimeAttr:       {node: 'timePicker',      type: 'class'}
      , _setTTitleAttr:         {node: 'tSelectTitle',    type: 'innerHTML'}
      , _setTToolTipAttr:       {node: 'tSelectTitle',    type: 'attribute',  attribute: 'title'}
      , _setDisableTimeAttr:    {node: 'tSelector',       type: 'attribute',  attribute: 'disabled'}
      , _setDisableFrameAttr:   {node: 'frameSelector',   type: 'attribute',  attribute: 'disabled'}
      , _setFirstTimeAttr:      {node: 'startTime',       type: 'innerHTML'}
      , _setFirstTimeShowAttr:  {node: 'startTime',       type: 'class'}
      , _setLastTimeAttr:       {node: 'endTime',         type: 'innerHTML'}
      , _setLastTimeShowAttr:   {node: 'endTime',         type: 'class'}
      , _setAnimateShowAttr:    {node: 'animateOptions',  type: 'class'}
      , _setToggleShowAttr:     {node: 'toggleButton',    type: 'class'}

    /**
     * constructor() - the initialization method.
     *
     * This is a really simple setup - let init() and postCreate() do the work
     */
      , constructor: function(params){
          this.inherited(arguments);
          // you only need to merge the system properties at instantiation. They don't change
          lang.mixin(this, sysConfig);
          this._addEventListeners();
          this._layer = params.layer;
          this._datesWithData = params.datesWithData; // this is a complex array of all the dates for which the dataset has data
          this._timeAxisUnits = params.timeAxisUnits; // don't know if I'll need this, but here it is
          this._nearestTimeIso = params.nearestTimeIso; // This is the date/time of the current layer view
          this. _latestDateSelected = params.nearestTimeIso.split("T")[0];

          this.id = this._layer.id+'_calendarBar';
          var _this = this;
          this._strings.init().then(function(){
            _this._messages = _this._strings.getMessages();
          });
      }

      /**
       * init() - Initialise the widget
       *
       * @see constructor()
       *
       */
      , init: function() {
          this._calendar = new calendar(
                                        { value: new Date(this._latestDateSelected)
                                        , isDisabledDate: lang.hitch(this, 'isDisabledDate')
                                        , onChange: lang.hitch(this, '_dateValueChanged')
                                        }
                                       ).placeAt(this.calWrapper);
          var _this = this;
          this._fetchTimeSteps().then(function() {
            if (!_this._timeSteps.length){
              _this._timeSteps[0]='00:00:00:000Z';
            }
            _this._makeTimeChooser();
          });
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
          this.destroyRecursive();
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
          this.set('title',  this._layer.getId()+'<br />'+this._messages.calTitle);
          this.init();
      }

      /**
       * isDisabledDate() - returns true or false to turn calendar dates on/off
       *
       * uses the metadata value datesWithData to do the search.
       *
       */

      , isDisabledDate: function(testDate) {
          var year = testDate.getFullYear();
          var month = testDate.getMonth();
          var day = testDate.getDate();
          if (this._datesWithData == null || this._datesWithData[year] == null || this._datesWithData[year][month] == null) {
            // No data for this year or month
            return true;
          }
          // Cycle through the array of days for this month, looking for the one we want
          var numDays = this._datesWithData[year][month].length;
          for (var d = 0; d < numDays; d++) {
              if (this._datesWithData[year][month][d] == day) {
                  return false; // We have data for this day
              }
          }
          // If we've got this far, we've found no data
          return true;
      }


      /**
       * build the selection element in the calendar bar to allow the user to
       * choose a time value for this layer to display.
       *
       */

      , _makeTimeChooser: function(){
          // Populate the drop-down list of z values
          while (this.tSelector.options.length) {
            this.tSelector.options.remove(0);
          }
          for (var _j = 0; _j < this._timeSteps.length; _j++) {
            var _tOption = new Option(this._timeSteps[_j].substr(0,8), this._timeSteps[_j]);
            this.tSelector.options.add(_tOption);
          }
          this.set('showTime', 'timePickerVisible');
          if (this._timeSteps.length == 1) {
            this.set('disableTime', true);
            this.set('tTitle',   this._messages.calTimeTitleOff);
            this.set('tToolTip', this._messages.calTimeToolTipOff);
          } else {
            this.set('disableTime', false);
            this.set('tTitle',   this._messages.calTimeTitleOn);
            this.set('tToolTip', this._messages.calTimeToolTipOn);
          }

        }


      /**
       * _fetchTimeSteps() - Fetch the timesteps for the currently visible day layer
       *
       * The returned array is used to populate the time selector for the static
       * data map. @see  _fetchAnimationTimeSteps() for the routine to determine the
       * actual timesteps within a selected timeframe.
       */

      , _fetchTimeSteps: function() {
          core.showThrobber();
          var _defObj = new deferred();
          var _this = this;
          server.getTimeSteps(this._layer.getServerURL(),
                                    { day: this._latestDateSelected
                                    , layerName: this._layer.getId()
                                    }
                              ).response.then(
            function(response) {
              _defObj.resolve((_this._timeSteps = response.data.timesteps)
                              , core.hideThrobber());
            }
          , function(err) {
              topic.publish('/peep/system/error', 'E_LAYERTIMESTEPS_RETRIEVE');
              _defObj.resolve((_this._timeSteps = [])
                              , core.hideThrobber());

            }
          );
          return _defObj;
      }

      /**
       * _fetchAnimationTimeSteps() - Fetch the timesteps within the current timeframe
       *
       * Not to be confused with _fetchTimeSteps() - see above
       *
       */

      , _fetchAnimationTimeSteps: function() {
          core.showThrobber();

          var _defObj = new deferred();
          var _this = this;
          server.getAnimationTimeSteps(this._layer.getServerURL(),
                                      { layerName:  this._layer.id
                                      , start:      this.firstTime
                                      , end:        this.lastTime
                                      }
                              ).response.then(
            function(response) {
              _defObj.resolve((_this._animationTimeSteps = response.data.timeStrings)
                              , core.hideThrobber());
            }
          , function(err) {
              topic.publish('/peep/system/error', 'E_LAYERTIMESTEPS_RETRIEVE');
              _defObj.resolve((_this._animationTimeSteps = [])
                              , core.hideThrobber());
            }
          );
          return _defObj;
      }

      /**
       * show() - makes this the visible calBar
       */

      , show: function(){
          domClass.remove(this.domNode, 'calendarBarHidden');
          if (this._timeSteps.length) {
            this.set('showTime', 'timePickerVisible');
          }
      }

      /**
       * hide() - Make this calendar Bar invisible
       */

      , hide: function(){
          domClass.add(this.domNode, 'calendarBarHidden');
          this.set('showTime', 'timePickerHidden');
      }

      /**
       * _timeValueChanges() - just the event handler for a time select click
       *
       * It has to do this because I multi-purpose the timeValueChanged()
       * method and I don't want to clutter it with spurious if/elses ...
       * so here's the "if its an event" bit ..
       *
       *  and anyway .. if you ever need to change the event handling bit ...
       *
       */
      , _timeValueChanged: function(e) {
          this.timeValueChanged(e.target.value);
      }

      , timeValueChanged: function(time) {
          this._latestTimeSelected = time;
          this._nearestTimeIso = this._latestDateSelected+"T"+time;
          this._layer.setNewTime(this._nearestTimeIso);
      }

      , _dateValueChanged: function(date){
          this.set('showTime', 'timePickerHidden');
          // if you try to convert it directly it does a timezone gotcha
          var _m = ("0"+(date.getMonth()+1).toString()).slice(-2);
          var _d = ("0"+date.getDate().toString()).slice(-2);
          this._latestDateSelected = date.getFullYear()+'-'+_m+'-'+_d;
          var _this = this;
          this._fetchTimeSteps(date).then(function() {
            // if there are > 1 entries in the array we need a time selector setting up
            time = ((_this._timeSteps.length  > 0)?_this._timeSteps[0]:'00:00:00.000Z');
              // populate the time picker with values and go switch the map to the new date
            _this._makeTimeChooser();
            _this.timeValueChanged(time);
          });
      }

      , _setFirstFrame: function(){
          if ((this.lastTime >= this._nearestTimeIso) || !this.lastTime) {
            this.set('firstTime', this._nearestTimeIso);
            this.set('firstTimeShow', 'tVisible');
            this._layer.killAnimation();
            this.hideToggleButton();
            this._checkAnimation();
          } else {
            // it's a user error so ....
            topic.publish('/peep/system/error', 'E_TIMES_INVERTED');
          }
      }

      , _setLastFrame: function(){
          if ((this.firstTime <= this._nearestTimeIso) || !this.firstTime) {
            this.set('lastTime', this._nearestTimeIso);
            this.set('lastTimeShow', 'tVisible');
            this._layer.killAnimation();
            this.hideToggleButton();
            this._checkAnimation();
          } else {
            // it's a user error so ....
            topic.publish('/peep/system/error', 'E_TIMES_INVERTED');
          }
       }

      , clearAnimation: function() {
          this._layer.killAnimation();
          this._layer.setVisibleLayer();
          this.hideToggleButton();
          this.set('firstTime', '');
          this.set('firstTimeShow', 'tHidden');
          this.set('lastTime', '');
          this.set('lastTimeShow', 'tHidden');
          this._checkAnimation();
      }

      , _checkAnimation:  function() {
          if (this.firstTime && this.lastTime) {
            this.set('animateShow', 'tVisible');
            this._populateFrameSelector();
          } else{
            this.set('animateShow', 'tHidden');
          }
      }

      , _frameCountChanged: function(){
          this._animationTimeString = this.frameSelector.value;
      }

      /**
       * Make the pull-down select item to choose the frame count
       *
       * The animation can be coarse or fine. Here's where we find
       * out how many steps are possible and offer sensible options
       * like hourly, daily, weekly frame steps. The smaller the steps
       * the longer the wait and the bigger the resultant map.
       *
       */
      , _populateFrameSelector: function() {
          this.set('disableFrame', true);
          var _this = this;
          this._fetchAnimationTimeSteps().then(function(){
                // Populate the drop-down list of frame sets
                while (_this.frameSelector.options.length) {
                  _this.frameSelector.options.remove(0);
                }
                var firstOption = false;
                for (var _j = 0; _j < _this._animationTimeSteps.length; _j++) {
                  var temp = _this._animationTimeSteps[_j].title;
                  var temp1 = temp.substr(temp.indexOf("(")+1, 5);
                  var temp2 = parseInt(temp1.substr(0,temp1.indexOf(" ")));
                  if (temp2 <= 100) {
                    firstOption = firstOption?firstOption:_j;
                    var _frameOption = new Option(_this._animationTimeSteps[_j].title, _this._animationTimeSteps[_j].timeString);
                    _this.frameSelector.options.add(_frameOption);
                  }
                }
                _this.set('disableFrame', false);
                _this._animationTimeString = _this._animationTimeSteps[firstOption].timeString;
          });
      }

      , _makeAnimation: function() {
          this.set('animateShow', 'tHidden');
          this._layer.buildAnimationLayer();

      }

      , showAniButton: function(){
          this.set('animateShow', 'tVisible');
      }
      , showToggleButton: function(){
          this.showAniButton();
          this.set('toggleShow', 'tVisible');
      }

      , hideToggleButton: function(){
          this.set('toggleShow', 'tHidden');
       }

      , _toggleAnimation: function(){
          this._layer.toggleAnimation();
      }

      , getTimeString: function() {
          return this._animationTimeString;
      }

      /**
       * Provide the selected time 'bracket' for animations and vertical plots
       *
       * returns false if the selections are not complete
       */
      , getTimeFrame: function() {
        if (!this.lastTime || !this.firstTime) {
          return false;
        } else {
          return [this.firstTime, this.lastTime];
        }
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
