/*********************************************************************************************************************
 *
 * Various polyfills for broader compatibility.
 *
 *********************************************************************************************************************/

/**
 * Polyfills CustomEvent for IE.
 *
 * This has been taken from MDN: <https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent>
 */
(function ()
{
    if ( typeof window.CustomEvent === 'function' )
    {
        return false;
    }

    function CustomEvent ( event, params )
    {
        params = params || { bubbles: false, cancelable: false, detail: undefined };
        let evt = document.createEvent( 'CustomEvent' );
        evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
        return evt;
    }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
}());

/**
 * Nodelist.forEach polyfill, mostly for the benefit of IE users.
 */
(function()
{
    if ( typeof NodeList.prototype.forEach !== 'function' )
    {
        NodeList.prototype.forEach = function( fCallback )
        {
            for ( let i = 0; i < this.length; i++ )
            {
                fCallback( this.item( i ), i, this );
            }
        }
    }
}());

/**
 * Number.isNaN polyfill, again mostly for IE.
 */
(function()
{
    if ( Number.isNaN === undefined )
    {
        Number.prototype.isNaN = value => ( typeof value === 'number' ) && isNaN( value );
    }
}());
