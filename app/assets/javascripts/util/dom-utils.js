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

/**
 * Removes all children from an element.
 *
 * @param {HTMLElement} el - the element to remove
 */
function empty( el )
{
  while (el.firstChild !== null)
  {
    el.firstChild.remove();
  }
}


/**
 * Binds multiple event listeners in one go. This is similar to jQuery on(), only in vanilla JS.
 *
 * @param {HTMLElement} el - the element to bind on
 * @param {String} sEvents - a space-separated list of events to bind.
 * @param {callable} fnListener - the listener to bind.
 */
function multibind( el, sEvents, fnListener )
{
  sEvents.trim().split( /\s+/ ).forEach( sEv => el.addEventListener( sEv, fnListener ));
}

/**
 * Like querySelectorAll, but also includes the top-level node if it matches the selector.
 *
 * @param {HTMLElement} elNode - the element to search from.
 * @param {String} sSelector - the selector to search for.
 * @return {Array} an array (not nodelist) of matching elements.
 */
function querySelectorAllWithSelf( elNode, sSelector )
{
  // 0. sanity check
  if ( elNode.querySelectorAll === undefined )
  {
    return [];
  }

  // 1. normal query
  const aElMatches = [].slice.call( elNode.querySelectorAll( sSelector ));

  // 2. push, if we also match
  if ( elNode.matches( sSelector ))
  {
    aElMatches.unshift( elNode );
  }

  return aElMatches;
}

module.exports = {
  wrap,
  create,
  empty,
  multibind ,
  querySelectorAllWithSelf
};
