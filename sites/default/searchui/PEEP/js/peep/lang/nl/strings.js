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
                                doNothing:             'Menu Sluiten (Neits Doen)'
                              , removeAllButThis:      'Alle andere lagen verwijderen'
                              , removeThisLayer:       'Dit laag verwijderen'
                              }
                  , messages: {
                                units:                'Eenheid'
                              , paletteHoverMessage:  'Klik het spectrum als u wilt\neen verschillende palette te selecteren'
                              , maxValueHoverMessage: 'Klik hier om het maximaal\schaalpunt te verwijderen'
                              , minValueHoverMessage: 'Klik hier om het minimaal\schaalpunt te verwijderen'
                              , logScaleHoverMessage: 'Klik hier om het logarithmic schaal te toggelen'
                              , logScaleText:         'Log Schaal'
                              , autoScaleHoverMessage:'Klik hier om het autoschalen te toggelen'
                              , autoScaleText:        'Auto Schaal'
                              , noLayerSelected:      'Op dit moment zijn er geen lagen geselecteerd'
                              , optionsTitleTargetDiv:'Laag selectie en opties'
                              , selectTitleTargetDiv: 'Laag Selectie'
                              , scaleTitleTargetDiv:  'Laag Kleuren'   
                              , calTitleTargetDiv:    'Datum/Tijd/Animatie Opties'
                              , miscTitleTargetDiv:   'Overige Opties'
                              , closeButton:          'Venster Sluiten'
                              , helpPage:             'Hupl Systeem'
                              , emptyPage:            'Leeg Venster'
                              , helpIsEmpty:          '<p>Dit pagina heeft geen inhoud.</p>'

                              }
                  };
    return strings;
});
