/*********************************************************************************************************************
 *
 * Provides latch-on-touch functionality so we can have something similar to hover-like behaviour on touch devices.
 *
 *********************************************************************************************************************/

const aElRoot = [];

/**
 * Removes touch class from all watched elements.
 *
 * @return {undefined}
 */
const removeAllClasses = () => aElRoot.forEach( el => el.classList.remove( '-touch' ));

/**
 * Global touch handler.
 *
 * @param {Event} ev - the touch event to handle
 */
function globalTouchHandler( ev )
{
    // look for the touch target in our list
    const elVictim = aElRoot.find( el => el.contains( ev.target ));

    // we’re not touching anything, so remove any and all classes
    if ( elVictim === undefined )
    {
        removeAllClasses();
        return;
    }

    // if the victim has not been touched, prevent anything else happening
    if ( !elVictim.classList.contains( '-touch' ))
    {
        ev.preventDefault();
        return;
    }


    // otherwise
    removeAllClasses();
    elVictim.classList.add( '-touch' );
}

module.exports = {
    name: 'softtouch',
    init: elRoot =>
    {
        // if this is the first call, bind the global handler
        if ( aElRoot.length === 0 )
        {
            document.body.addEventListener( 'touchend', globalTouchHandler );
        }

        // dump the item on our list of elements
        aElRoot.push( elRoot );
    }
}
