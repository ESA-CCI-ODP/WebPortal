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
                                        type: 'error', duration: 0}
        , E_LAYERMETA_RETRIEVE:       { message: 'Error attempting to retrieve layer metadata',
                                        type: 'fatal',   duration: 0}
        , E_SELECTOR_CREATE:          { message: 'Fout met Laag Selecie Menu Creeren',
                                        type: 'fatal',   duration: 0}
        , E_BAD_LAYER_TYPE:           { message: 'Layer metadata error - Bad layer type provided',
                                        type: 'error',   duration: 0}
        , E_LAYERTIMESTAMP_RETRIEVE:  { message: 'Error attepting to retrieve layer time stamp data',
                                        type: 'error',   duration: 0}
        , E_LAYERMINMAX_RETRIEVE:     { message: 'Non-critical Error attempting to retrieve min/max data points for this view',
                                        type: 'error',   duration: 0}
        , E_LAYERMINMAX_RETRIEVE:     { message: 'Non-critical Error attempting to retrieve attributions for that data point',
                                        type: 'error',   duration: 0}
        , E_LOGSCALE_NEGATIVE:        { message: 'Logarithimic scales are not possible for a scale with negative data points',
                                        type: 'warning',   duration: 0}
    };
    return strings;
});
