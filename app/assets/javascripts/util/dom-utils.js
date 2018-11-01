/*********************************************************************************************************************
 *
 * Various DOM utilities.
 *
 *********************************************************************************************************************/

/**
 * Wraps one element in another.
 *
 * @param {HTMLElement} el - the element to be wrapped
 * @param {HTMLElement} elWrap - the element with which to wrap it.
 */
function wrap( el, elWrap )
{
    // 1. insert the wrapper
    el.parentNode.insertBefore( elWrap, el );

    // 2. detatch + reattatch
    el.parentNode.removeChild(el);
    elWrap.appendChild(el);
}

/**
 * Creates a new element based on the given name and attributes.
 *
 * @param   {string} sElement - the name of the element to create.
 * @param   {object} oAttr    - an object containing attributes to add (optional)
 * @param   {string} sContent - any content to insert (optional)
 * @return  {HTMLElement} the newly-created element.
 */
function create( sElement, oAttr = {}, sContent = null )
{
    // 1. create the element
    const el = document.createElement( sElement );

    // 2. if we have any classes
    if ( oAttr.class !== undefined )
    {
        oAttr.class.split( /\s+/ ).forEach( sC => el.classList.add( sC ));
        delete oAttr.class;
    }

    // 3. everything else…
    Object.keys( oAttr ).forEach( k =>
    {
        el.setAttribute( k, oAttr[k] );
    })

    // 4. insert content, where applicable
    if (sContent !== null)
    {
        el.appendChild( document.createTextNode( sContent ));
    }

    return el;
}

module.exports = { wrap, create };
