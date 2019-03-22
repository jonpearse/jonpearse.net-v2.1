/*********************************************************************************************************************
*
* Quick and dirty templating based on simple search/replace.
*
*********************************************************************************************************************/

/**
* Scans the provided object for the given property, recursing within as requried.
*
* @param   {Object} oObject - the object we’re scanning
* @param   {String} sProperty - the property to scan for
* @return  {String} the string value of the requested property, or an empty string if the property wasn’t found
*/
function scan( oObject, sProperty )
{
  // if we have a nested property, recurse
  if (sProperty.indexOf( '.' ) !== -1)
  {
    let aProp = sProperty.split( '.', 2 );

    return ( oObject[aProp[0]] !== undefined ) ? scan( oObject[aProp[0]], aProp[1] ) : '';
  }

  // otherwise…
  return ( oObject[sProperty] !== undefined ) ? oObject[sProperty] : '';
}

/**
* Formats an object based on a mustache-like HTML template string. This only does very simple substitution-based
* formatting, so don’t expect iteration + callbacks =)
*
* @param {Object} oObject - the object to format
* @param {String} sTemplate - the template to use
* @return {String} the formatted object
*/
module.exports = ( oObject, sTemplate = '' ) =>
{
  return sTemplate.replace( /{{(.*?)}}/g, ( match, s ) => scan( oObject, s ));
};
