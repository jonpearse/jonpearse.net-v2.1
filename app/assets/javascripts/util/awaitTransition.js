/*********************************************************************************************************************
 *
 * Promised-based wrapper for transitionend events.
 *
 *********************************************************************************************************************/

/**
 * Returns a promise that is resolved the first time a transitionend event occurs on the provided element.
 *
 * @param {HTMLElement} el - the element to watch
 * @return {Promise} a promise
 */
module.exports = el => new Promise( fnResolve =>
{
    function _resolve()
    {
        el.removeEventListener( 'transitionend', _resolve );
        fnResolve();
    }

    el.addEventListener( 'transitionend', _resolve );
});
