/*********************************************************************************************************************
 *
 * Search filter JS: autosubmits some time after the last user interaction
 *
 *********************************************************************************************************************/

const TIMEOUT = 500;

function filters( elRoot )
{
    let oTo;
    let aElBoxen;
    let sRootUri;

    /**
     * Submit the form.
     */
    function doSubmit()
    {
        // 1. clear any existing timeout
        clearTimeout(oTo);

        // 2. work out where we’re submitting
        let sQuery = aElBoxen.map( el => ( el.checked ? `${el.name}=${el.value}` : null )).filter( Boolean ).join( '&' ).trim();
        const sUri = sRootUri + ( sQuery === '' ? '' : `?${sQuery}` );

        // 3. fire an event to the sideloader
        elRoot.dispatchEvent( new CustomEvent( 'navigateTo', { bubbles: true, detail: { url: sUri }}));
    }

    /**
     * Callback: called when the filters are updated, resets the timer.
     */
    function handleFilterUpdate()
    {
        clearTimeout(oTo);
        oTo = setTimeout(doSubmit, TIMEOUT);
    }

    /** Constructor logic */
    return (function init()
    {
        // get the checkboxes + bind them
        aElBoxen = [].slice.call( elRoot.querySelectorAll( 'input' ));
        aElBoxen.forEach(el => el.addEventListener('change', handleFilterUpdate));

        // grab a root URL
        const aLink = document.createElement( 'a' );
        aLink.href = elRoot.action;
        sRootUri = aLink.pathname;
    }());
}

module.exports = {
    name: 'filters',
    init: filters
}
