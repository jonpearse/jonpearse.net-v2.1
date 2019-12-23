/*********************************************************************************************************************
 *
 * Handy wrapper for MutationObserver that watches for the insertion/removal of nodes from a DOM tree filtered by a
 * given selector with callbacks.
 *
 *********************************************************************************************************************/

const { querySelectorAllWithSelf } = require( 'util/dom-utils' );

/**
 * Bind a mutation observer to the given DOM node, that calls the appropriate callback when child nodes matching the
 * given filter are added or removed from the DOM tree.
 *
 * @param {HTMLElement} elRoot - the DOM node to watch.
 * @param {String} sSelector - the selector to match changed elements.
 * @param {Function} onAdd - a callback function to call when a matching element is added.
 * @param {Function} onRemove - a callback function to call when a matching element is removed (optional)
 * @return {Function} a teardown function.
 */
module.exports = ( elRoot, sSelector, onAdd, onRemove = () => {} ) =>
{
  const filterNodes = fCallback => elNode => querySelectorAllWithSelf( elNode, sSelector ).forEach( fCallback );
  const handleMutation = oMutation =>
  {
    oMutation.addedNodes.forEach( filterNodes( onAdd ));
    oMutation.removedNodes.forEach( filterNodes( onRemove ));
  }

  return (function init()
  {
    // create the observer
    const oObserver = new MutationObserver( aMutations => aMutations.forEach( handleMutation ));

    // start listening to stuff
    oObserver.observe( elRoot, { childList: true, subtree: true });

    // return a teardown
    return () => oObserver.disconnect();
  }())
}
