/**
 * peep/lang/xx/errors - the language string-substitution file for error messages
 *
 * There is one each of the strings.js, help.js and errors.js file in each of the
 * lang sub-directories. They contain the string substitutions for the messages
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
          E_MENUMETA_RETRIEVE:        { message: 'Error attempting to retrieve menu list from at least one of the servers',
                                        type: 'error',   duration: 0}
        , E_LAYERMETA_RETRIEVE:       { message: 'Error attempting to retrieve layer metadata',
                                        type: 'fatal',   duration: 0}
        , E_SELECTOR_CREATE:          { message: 'Error creating the layer select menu',
                                        type: 'fatal',   duration: 0}
        , E_BAD_LAYER_TYPE:           { message: 'Layer metadata error - Bad layer type provided',
                                        type: 'error',   duration: 0}
        , E_LAYERTIMESTAMP_RETRIEVE:  { message: 'Error attepting to retrieve layer time stamp data',
                                        type: 'error',   duration: 0}
        , E_LAYERTIMESTEPS_RETRIEVE:  { message: 'Error attepting to retrieve the time steps for this data layer',
                                        type: 'error',   duration: 0}
        , E_LAYERMINMAX_RETRIEVE:     { message: 'Non-critical Error attempting to retrieve min/max data points for this view',
                                        type: 'error',   duration: 0}
        , E_LAYERPOINT_RETRIEVE:      { message: 'Non-critical Error attempting to retrieve attributions for that data point',
                                        type: 'error',   duration: 0}
        , E_LAYERSETMAX:              { message: 'You cannot set a MAX value which is less than the MIN value',
                                        type: 'warning', duration: 10000}
        , E_LAYERSETMIN:              { message: 'You cannot set a MIN value which is greater than the MAX value',
                                        type: 'warning', duration: 10000}
        , E_POINTNODATA:              { message:  'It is not possible to retrieve data from this dataSet. '+
                                                  'This normally indicates that the owners have locked it down.',
                                        type: 'warning', duration: 10000}
        , E_LOGSCALE_NEGATIVE:        { message: 'Logarithimic scales are not possible for a scale with negative data points',
                                        type: 'warning', duration: 10000}
        , E_TIMES_INVERTED:           { message: 'Your start date is later than your end date. This is not possible. Action ignored',
                                        type: 'warning', duration: 10000}
        , E_NO_SNAPSHOT:              { message: 'For some reason it was not possible to retrieve the snapshot you requested.',
                                        type: 'warning', duration: 10000}
        , E_ANI_TOO_BIG:              { message: 'The system cannot generate an animation with a width or height greater than'+
                                                 ' 1025 pixels. Please reduce the size of your browser window and try again.',
                                        type: 'error', duration: 0}
    };
    return strings;
});
