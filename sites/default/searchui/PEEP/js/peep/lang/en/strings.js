/**
 * peep/lang/xx/strings - the language string-substitution file for messages and menus
 * 
 * There is one each of the strings.js, help.js and errors.js file in each of the lang 
 * sub-directories. They contain the string substitutions for the messages
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

define([]
, function() {
    var strings = {
                    menus:    {
                                doNothing:             'Close this Menu (do nothing)'
                              , removeAllButThis:      'Remove all other layers except this one'
                              , removeThisLayer:       'Remove this layer from the current view'
                              }
                  , messages: {
                                loading:                    'Loading - Please Wait'
                              , units:                      'Units'
                              , paletteHoverMessage:        'Click the Colour Bar to\nselect a different palette'
                              , maxValueHoverMessage:      'Type here to change the\nmaximum scale range'
                              , minValueHoverMessage:       'Type here to change the\nminimum scale range'
                              , logScaleHoverMessage:       'Click to toggle logarithmic scaling on/off'
                              , logScaleText:               'Log Scale'
                              , autoScaleHoverMessage:      'Click to toggle automatic scaling on/off'
                              , autoScaleText:              'Auto Scale'
                              , revertButtonHoverMessage:   'Click to set the scale bounds back to the initial default state'
                              , revertText:                 'Restore original scale'
                              , snapshotButtonHoverMessage: 'Click to take a snapshot of this view of the cuirrent layer'
                              , snapshotText:               'Take a Snapshot'
                              , snapshotPopupText:          'To save this screenshot, right click on the image and select "Save Image As"'
                              , noLayerSelected:            'No layers have been selected yet'
                              , optionsTitleTargetDiv:      'Display and Layer Options'
                              , selectTitleTargetDiv:       'Select Layers'
                              , scaleTitleTargetDiv:        'Scale Bar'   
                              , calTitleTargetDiv:          'Date/Time/Animate Options'
                              , miscTitleTargetDiv:         'Miscellaneous Options'
                              , closeButton:                'Close this Pop Up'
                              , helpPage:                   'Help Sub-System'
                              , emptyPage:                  'Empty Page'
                              , helpIsEmpty:                '<p>The current page has no content</p>'
                              , helpSystemIndex:            '<h2>Help System Index</h2>'
                              , paletteSelectionTitle:      'Colour Palette Selection Dialog'
                              , bandSelectLabel:            'Number of Scale Divisions'
                              , bandSelectToolTip:          'Select the ganularity of\nthe scale divisions here'
                              , setMinScale:                'Set the minimum value of the colour scale to '
                              , setMaxScale:                'Set the maximum value of the colour scale to '
                              , verticalProfileToolTip:     'The layer has several levels in the z-axis.'
                              , verticalProfilePrompt:      'Click here to view a vertical profile plot'
                              , timeProfileToolTip:         'You have defined a time sequence'
                              , timeProfilePrompt:          'Click here to view a time profile plot'
                              , calTitle:                   ' date/time options'
                              , calTimeTitleOn:             'Please choose a time'
                              , calTimeTitleOff:            'Only one time step'
                              , calTimeToolTipOn:           'There are several datasets within this one date.\nPlease select one time step which you wish to display'
                              , calTimeToolTipOff:          'There is only one timestep associated with this date.\nIt has already been selected'
                              , timeStepFirstPrompt:        'Start Time'
                              , timeStepFirstToolTip:       'Click here to set the currently selected time as the start time\nof a time sequence to use for animation or point data display.'
                              , timeStepLastPrompt:         'End Time'
                              , timeStepLastToolTip:        'Click here to set the currently selected time as the end time\nof a time sequence to use for animation or point data display.'
                              , timeSequenceOptions:        'Time Sequence Options'
                              , animateButtonPrompt:        'Create Animation'
                              , animateButtonToolTip:       'Click here to create and display an animation of the data in the time frame you have specified above.\nPLEASE NOTE - A large number of frames will ltake a long time to generate.'
                              , animateTogglePrompt:        'Toggle Animation on/off'
                              , animateToggleToolTip:       'Click here to switch between static and animated data display.'
                              , animateClearPrompt:         'Remove the Animation'
                              , animateClearToolTip:        'Click here to clear the animation layer. Do this if you want to save memory.\nYou will need to recreate the animation to view it again.'
                              , frameSelectTitle:           'Animation Frames'
                              , ugTitle:                    'PEEP Data Visualisation Tool - User Guide'
                              }
                  };
    return strings;
});
