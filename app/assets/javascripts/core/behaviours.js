/*********************************************************************************************************************
 *
 * Handles registration and triggering of behaviours.
 *
 *********************************************************************************************************************/

const observer = require( 'util/filtered-mutation-observer' );

// Internal register of behaviours
const oRegisteredBehaviours = [];

/**
 * Wrapper that fires the specified event on the given node.
 *
 * @param {HTMLElement} el - the element to fire on
 * @param {String} sEvt - the event to fire
 * @param {Object} oData - the detail to attach to the event.
 * @return {Boolean} true if the event is cancelable, false otherwise
 */
const fireEvent = ( el, sEvt, oData = {} ) => el.dispatchEvent( new CustomEvent( sEvt, { bubbles: true, detail: oData }));

/**
 * Returns options for a behaviour in the given namespace.
 *
 * @param {HTMLElement} el - the element to read from
 * @param {String} sNamespace - the namespace to read options from
 * @param {Object} oDefaults - an array containing default options.
 * @return {Object} an objet containing options read from the DOM.
 */
function getOptionsFor( el, sNamespace, oDefaults )
{
  // 1. copy the defaults so we can manipulate it without causing issues, also construct a regex to match behaviours
  const oReturn = Object.assign( {}, oDefaults );
  const oRegex  = new RegExp( `^${sNamespace}(.*)$` );

  // 2. handy callback function
  const fnAssign = ( key, value ) =>
  {
    // a. cast truth-falsey–ness
    if (( value === 'true' ) || ( value === '' ))
    {
      value = true;
    }
    else if ( value === 'false' )
    {
      value = false;
    }

    // b. convert the key + assign
    key = key.substr( 0, 1 ).toLowerCase() + key.substr( 1 );
    oReturn[ key ] = value;
  }

  // 3. iterate
  Object.keys( el.dataset ).forEach( sKey =>
  {
    let aMatch;
    if (( sKey !== 'behaviour') && (( aMatch = oRegex.exec( sKey )) !== null ))
    {
      fnAssign( aMatch[1], el.dataset[ sKey ]);
    }
  });

  // 4. return
  return oReturn;
}

/**
 * Bind all behaviours on a given element. This will attempt to rebind if possible.
 *
 * @param {HTMLElement} elNode - the element to attempt to bind on.
 */
function bindNode( elNode )
{
  const bind = sBh =>
  {
    const oBh = oRegisteredBehaviours[ sBh ];
    const oBound = oBh.init( elNode, getOptionsFor( elNode, oBh.namespace, oBh.defaults ));
    if ( oBound !== null )
    {
      console.log( `Bound component ${sBh}`, elNode );
      elNode.boundBehaviours[ sBh ] = oBound;
      fireEvent( elNode, 'behaviourBound', { behaviour: sBh, firstTime: true });
    }
  }

  const rebind = sBh =>
  {
    // a. can we actually do this?
    if ( elNode.boundBehaviours[ sBh ] === undefined )
    {
      return false;
    }

    // b. call a rebind, if possible
    if ( elNode.boundBehaviours[ sBh ].teardown !== undefined )
    {
      console.log( `Rebinding component ${sBh}`, elNode );
      elNode.boundBehaviours[ sBh ].rebind();
      fireEvent( elNode, 'behaviourBound', { behaviour: sBh, firstTime: false });
    }

    return true;
  }

  // bind all behaviours
  elNode.dataset.behaviour.trim().split( /\s+/ ).forEach( sBh =>
  {
    // 1. check we know about the behaviour
    if ( oRegisteredBehaviours[ sBh ] === undefined )
    {
      console.warn( `Attempting to bind unknown behaviour ${sBh}` );
      return;
    }

    // 2. if we’re already bound?
    elNode.boundBehaviours = elNode.boundBehaviours || {};
    if ( rebind( sBh ) )
    {
      return;
    }

    // 4. bind!
    bind( sBh );
  });

  // call
  fireEvent( elNode, 'allBehavioursBound' );
}

/**
 * Unbinds all behaviours on a given element.
 *
 * @param {HTMLElement} elNode - the element to unbind.
 */
function unbindNode( elNode )
{
  // if there were never any behaviours bound…
  if ( elNode.boundBehaviours === undefined )
  {
    return;
  }

  // iterate through…
  Object.keys( elNode.boundBehaviours ).forEach( sBh =>
  {
    // if we can’t do anything…
    if ( elNode.boundBehaviours[ sBh ].teardown === undefined )
    {
      return;
    }

    // teardown
    console.log( `Tearing down ${sBh}`, elNode );
    elNode.boundBehaviours[ sBh ].teardown();
    fireEvent( elNode, 'behaviourUnbound', { behaviour: sBh });
  });

  // delete things
  delete elNode.boundBehaviours;
}

/**
 * Bind all behaviours from a point (usuall the DOM root). This will bind any existing behaviours, and watch for new
 * mutations.
 *
 * @param {HTMLElement} elRoot - the root node to watch
 */
function bindAndWatch( elRoot = document )
{
  // bind existing nodes
  elRoot.querySelectorAll( '[data-behaviour]' ).forEach( bindNode );

  // watch things
  observer( elRoot, '[data-behaviour]', bindNode, unbindNode );
}

/**
 * Register behaviours, optionally with autobinding.
 *
 * @param {Array} aoBehaviour - an array of behaviour objects.
 * @param {Boolean} bAutoBind - true to autobind, false otherwise (Default: true)
 */
function registerBehaviours( aoBehaviour, bAutoBind = true )
{
  /**
   * Internal handling function.
   *
   * @param {Object} oBehaviour - the behaviour to register.
   */
  const register = oBehaviour =>
  {
    // 1. default things out
    oBehaviour = Object.assign({
      defaults: [],
      namespace: ''
    }, oBehaviour );

    // 2. check things
    if (( oBehaviour.name === undefined ) || ( oBehaviour.init === undefined ))
    {
      throw new TypeError( 'Trying to register poorly-formed behaviour: failing' );
    }

    // 3. do we already know about this?
    if ( oRegisteredBehaviours[ oBehaviour.name ] !== undefined )
    {
      throw new TypeError( `Trying to register duplicate behaviour ${oBehaviour.name}` );
    }

    // 4. register it + let the world know
    oRegisteredBehaviours[ oBehaviour.name ] = oBehaviour;
    fireEvent( document.body, 'behaviourRegistered', { behaviour: oBehaviour.name });
  }

  // map behaviours
  aoBehaviour.forEach( register );
  ( bAutoBind && bindAndWatch() );
}

// expose stuff
module.exports = {
  init: registerBehaviours,
  bind: bindAndWatch,
  bindNode,
  unbindNode
};
