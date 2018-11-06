/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

/**
 * Recursively converts an object to query string.
 *
 * @param {mixed} oData - the inbound data
 * @param {String} sPrefix - an optional prefix
 * @return {String} a URL-encoded string
 */
function objectToQueryString(oData, sPrefix = '')
{
    let sSuffix = (sPrefix === '') ? '' : '%5D';

    return Object.keys(oData).map(k =>
    {
        let v = oData[k];

        // a. bail if it’s null
        if (v === null)
        {
            return;
        }

        // b. if it’s an object, go downward
        if (typeof v === 'object')
        {
            return objectToQueryString(v, `${sPrefix}${sSuffix}${encodeURIComponent(k)}%5B`);
        }

        return `${sPrefix}${encodeURIComponent(k)}${sSuffix}=${encodeURIComponent(v)}`;

    }).filter(el => el !== null).join('&');
}

const DEFAULT_OPTIONS = {
    sMethod:    'GET',
    bJson:      true,
    oHeaders:   {}
};

function AjaxRequest( sUri, oData = null, methodOrOptions = {} )
{
    let oOptions;

    /**
     * Normalises inbound options.
     */
    function normaliseOptions()
    {
        // 1. if we were provided with a string, convert it to an object
        if ( typeof methodOrOptions === 'string' )
        {
            methodOrOptions = { sMethod: methodOrOptions };
        }

        // 2. merge some defaults
        oOptions = Object.assign( {}, DEFAULT_OPTIONS, methodOrOptions );
        oOptions.sMethod = oOptions.sMethod.toUpperCase();
    }

    /**
     * Converts inbound data into a query string if it’s not already in a format supported by the fetch API.
     */
    function preprocessData()
    {
        // if it’s already the right type, we can just bail
        if (( oData === null ) || ( typeof oData === 'string' ) || ( oData instanceof FormData ))
        {
            return;
        }

        // otherwise, convert using our utility function
        oData = objectToQueryString( oData );
    }

    /**
     * Appends any querystring to the URL for GET and HEAD requests, as these cannot have bodies.
     */
    function preprocessGetRequests()
    {
        // if we don't need to do anything, never mind
        if ((oData === null) || (oOptions.sMethod !== 'GET' && oOptions.sMethod !== 'HEAD'))
        {
            return;
        }

        // otherwise, append things
        sUri += ( sUri.indexOf( '?' ) === -1 ? '?' : '&' ) + oData;
        oData = null;
    }

    /**
     * Adds additional headers.
     */
    function addHeaders()
    {
        // 1. CSRF header + XHR flag
        oOptions.oHeaders[ 'X-CSRF-Token' ] = document.querySelector( 'meta[name=csrf-token]' ).getAttribute( 'content' );
        oOptions.oHeaders[ 'X-Requested-With' ] = 'XMLHttpRequest';

        // 2. if we’re wanting JSON…
        if ( oOptions.bJson )
        {
            oOptions.oHeaders.Accept = 'application/json;q0.9,*/*;q=0.8';
        }

        // 3. send a content type for POST data that isn’t FormData
        if ((oOptions.sMethod === 'POST') && !(oData instanceof FormData))
        {
            oOptions.oHeaders['Content-Type'] = 'application/x-www-form-urlencoded; charset=utf-8';
        }
    }

    /**
     * Actual functionality.
     */
    return (function init()
    {
        // 1. normalise our options
        normaliseOptions();

        // 2. process any data
        preprocessData();

        // 3. if we’re performing a GET or HEAD request, we can't have a body, so append any data to the URL.
        preprocessGetRequests();

        // 4. construct any additional headers
        addHeaders();

        // 5. FIRE!
        return fetch( sUri, {
            method:     oOptions.sMethod,
            headers:    oOptions.oHeaders,
            body:       oData,
            credentials: 'same-origin', // we want to send cookies
        }).then( response => ( oOptions.bJson ? response.json() : response.text() ));  // auto-convert JSON

    }());
}

module.exports = AjaxRequest;
