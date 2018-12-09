/*********************************************************************************************************************
 *
 * Search filter JS: autosubmits some time after the last user interaction
 *
 *********************************************************************************************************************/

const TIMEOUT = 500;

function filters( elRoot )
{
    let oTo;

    /**
     * Submit the form.
     */
    function doSubmit()
    {
        clearTimeout(oTo);
        elRoot.submit();
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
        elRoot.querySelectorAll('input').forEach(el => el.addEventListener('change', handleFilterUpdate));
    }());
}

module.exports = {
    name: 'filters',
    init: filters
}
