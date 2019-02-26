/*********************************************************************************************************************
*
* Handles the registration and triggering of behaviours.
*
*********************************************************************************************************************/

// internal register of behaviours
const oRegisteredBehaviours = {};

/**
 * Returns options for a behaviour in a given namespace.
 *
 * @param   {HTMLElement} el - the element to read from
 * @param   {String} sNamespace - the namespace from which to read options
 * @param   {Object} oDefaults - an object containing defaults for the behaviour
 * @return  {Object} the options for this behaviour
 */
/* eslint-disable complexity */
function getOptionsFor( el, sNamespace, oDefaults )
{
    // 1. return variable and regex object
    const oReturn = Object.assign( {}, oDefaults );
    const oRegex  = new RegExp( `^${sNamespace}(.*)$` );

    // 2. useful callback function
    let fnAssign = ( key, value ) =>
    {
        // a. if it’s the behaviour hook…
        if (( key === 'behaviour' ) || ( key === 'boundBehaviours' ))
        {
            return false;
        }

        // b. if it’s truthy/falsey
        if (( value === 'true' ) || ( value === '' ))
        {
            value = true;
        }
        else if ( value === 'false' )
        {
            value = false;
        }

        // c. convert the key
        key = ( '' + key ).replace( sNamespace, '' );
        key = key.substr( 0, 1 ).toLowerCase() + key.substr( 1 );

        // d. assign
        oReturn[key] = value;
    };

    // 3. iterate through dataset looking for matching attributes
    Object.keys( el.dataset ).forEach( sKey =>
    {
        if (( sNamespace === '' ) || oRegex.test( sKey ))
        {
            fnAssign( sKey, el.dataset[sKey] );
        }
    });

    // 2. return
    return oReturn;
}
/* eslint-enable complexity */

/**
* Binds behaviours on a specific element.
*
* @param   {HTMLElement} elBindAt - the root HTML element at which we should start binding
*/
function bindBehaviours( elBindAt = document )
{
    // 1. start binding
    elBindAt.querySelectorAll( '[data-behaviour]' ).forEach( elNode =>
    {
        elNode.dataset.behaviour.trim().split( /\s+/ ).forEach( sBehaviour =>
        {
            // a. if we don’t know about that behaviour
            if ( oRegisteredBehaviours[sBehaviour] === undefined )
            {
                console.warn( `Attempting to bind unknown behaviour ‘${sBehaviour}’` );
                return false;
            }

            // b. if we’ve already bound that behaviour
            elNode.boundBehaviours = elNode.boundBehaviours || {};
            if ( elNode.boundBehaviours[sBehaviour] !== undefined )
            {
                console.warn( `Attempting to rebind behaviour ’${sBehaviour}‘: ignoring` );
                return false;
            }

            // b. get some options
            const oBehaviour = oRegisteredBehaviours[sBehaviour];
            const oOptions   = getOptionsFor( elNode, oBehaviour.namespace, oBehaviour.defaults );

            // c. debug
            // console.group( `Binding behaviour ‘${sBehaviour}’` );
            // console.debug( 'Options:', oOptions );
            // console.groupEnd();

            // d. fire the behaviour and store it
            try
            {
                elNode.boundBehaviours[sBehaviour] = oBehaviour.init( elNode, oOptions );
            }
            catch ( ex )
            {
                console.error( ex );
            }
        });
    });
}

/**
* Registers an array of behaviours, optionally with autobinding.
*
* @param {Array} aoBehaviour - an array of behaviour objects
* @param {boolean} bAutoBind - whether or not to immediately autobind to the document (default: true)
* @return {boolean} true on success, false otherwise
*/
function registerBehaviours( aoBehaviour, bAutoBind = true )
{
    // 1. iterate through behaviours
    aoBehaviour.forEach( oBehaviour =>
    {
        // a. default things out
        oBehaviour = Object.assign({
            defaults: {},
            namespace: '',
        }, oBehaviour );

        // b. if we don’t have a name or init
        if (( oBehaviour.name === undefined ) || ( oBehaviour.init === undefined ))
        {
            throw new TypeError( 'No name or initialiser found for behaviour' );
        }

        // c. if we already know about that behaviour
        if ( oRegisteredBehaviours[oBehaviour.name] !== undefined )
        {
            throw new TypeError( `Duplicate behaviour ‘${oBehaviour.name}’` );
        }

        // d. register it
        oRegisteredBehaviours[oBehaviour.name] = oBehaviour;
        // console.group( `Registered behaviour ‘${oBehaviour.name}’` );
        // console.debug( 'Defaults:',  oBehaviour.defaults );
        // console.debug( 'Namespace:', oBehaviour.namespace );
        // console.groupEnd();
    });

    // 2. if we’re autobinding, do so
    ( bAutoBind && bindBehaviours() );
    return true;
}

module.exports = {
    init: registerBehaviours,
    bind: bindBehaviours,
};
