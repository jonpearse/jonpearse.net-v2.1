/*********************************************************************************************************************
 *
 * Side-loaded page stuff.
 *
 *********************************************************************************************************************/

const ajax = require( 'util/ajax' );
const rebind = require( 'core/behaviours' ).bind;
const lazyload = require( 'util/lazyload' );

const awaitTransition = el => new Promise( fnResolve =>
{
    function _resolve()
    {
        el.removeEventListener( 'transitionend', _resolve );
        fnResolve();
    }

    el.addEventListener( 'transitionend', _resolve );
})

function Page( elRoot )
{
    let elNav = null;
    let elTitle = null;
    let elContent = null;

    /**
     * Updates the page with the content returned from an AJAX call.
     *
     * @param {Object} oData - the new page data.
     * @return {Object} the returned data for chaining purposes
     */
    function updateContent( oData )
    {
        // fade all the content out, then…
        elContent.classList.add( '-out' );
        awaitTransition( elContent ).then( () =>
        {
            // 1. update the title
            elTitle.textContent = oData.title;

            // 2. remove all content + insert new
            while ( elContent.firstChild !== null )
            {
                elContent.firstChild.remove();
            }
            elContent.insertAdjacentHTML( 'afterbegin', oData.content );

            // 3. retrigger our behaviours, lazyload, and rebind all links
            rebind( elContent );
            bindLinks( elContent ); // eslint-disable-line no-use-before-define
            lazyload( elContent );

            // 4. update the nav state
            elNav.querySelectorAll( 'a' ).forEach( el =>
            {
                if (( el.pathname === oData.path ) ||
                    ( el.hasAttribute( 'data-wildcard' ) && oData.path.startsWith( el.pathname )))
                {
                    el.classList.add( '-current' );
                }
                else
                {
                    el.classList.remove( '-current' );
                }
            });

            // 4. finally, remove any active elements, scroll up, and remove the load state(s)
            document.activeElement.blur();
            window.scrollTo( 0, 0 );

        }).then( () =>
        {
            elContent.classList.remove( '-out' );
            awaitTransition( elContent ).then(() => elContent.classList.remove( '-loading' ));
        });

        // container classes
        elRoot.classList.add( '-js-loaded' );
        elRoot.classList.remove( '-js-loading' );
        setTimeout( () => elRoot.classList.remove( '-js-loaded' ), 500 );

        // return the inbound data for chaining
        return oData;
    }

    /**
     * Pushes the newly-acquired data onto the browser’s history state.
     *
     * @param {Object} oData - the data to push
     */
    function pushState( oData )
    {
        window.history.pushState( oData, oData.title, oData.path );
    }

    /**
     * Pops stuff off the history state.
     *
     * @param {PopStateEvent} ev - the data we’ve just popped off the stack
     */
    function popState( ev )
    {
        // 1. if we have some state data, reload the page with that
        if ( ev.state !== null )
        {
            elContent.classList.add( '-loading' );
            elRoot.classList.remove( '-js-loaded' );
            elRoot.classList.add( '-js-loading' );
            updateContent( ev.state );
            return;
        }

        // 2. otherwise, just reload the page
        window.location.reload();
    }

    /**
     * Stores the initial state.
     */
    function storeInitialState()
    {
        // 1. acquire a state
        const oState = {
            title: elTitle.textContent,
            content: elContent.innerHTML,
            path: document.location.pathname
        };

        // 2. update the current state
        window.history.replaceState( oState, elTitle.textContent, document.location.pathname );
    }

    /**
     * Loads a given URL.
     *
     * @param {String} sUrl - the URL
     * @return {boolean} whether or not the navigation will be successful.
     */
    function navigateTo( sUrl )
    {
        // 1. request
        ajax( sUrl ).then( updateContent ).then( pushState ).catch( () => document.location.href = sUrl );

        // 2. classes
        elContent.classList.add( '-loading' );
        elRoot.classList.remove( '-js-loaded' );
        elRoot.classList.add( '-js-loading' );
        return true;
    }

    /**
     * Binds links within the given DOM node.
     *
     * @param {HTMLElement} elNode - the node to search within.
     */
    function bindLinks( elNode )
    {
        elNode.querySelectorAll( 'a:not([href^="http:"]):not([href^="https:"]):not([href^="mailto:"])').forEach( elLink =>
        {
            elLink.addEventListener( 'click', ev => ( navigateTo( elLink.pathname ) && ev.preventDefault()));
        })
    }

    /* Constructor */
    return (function init()
    {
        // 1. acquire DOM nodes
        elNav = elRoot.querySelector( '[data-page-nav]' );
        elContent = elRoot.querySelector( '[data-page-content]' );
        elTitle = document.querySelector( 'head title' );
        if (( elNav === null ) || ( elContent === null ) || ( elTitle === null ))
        {
            return;
        }

        // 2. store the current state
        storeInitialState();

        // 3. bind links + popstate
        bindLinks( elRoot );
        window.addEventListener( 'popstate', popState );

        // 4. add class
        elContent.classList.add( 'js-page' );

    }());
}

module.exports = {
    name: 'page',
    init: Page
};
