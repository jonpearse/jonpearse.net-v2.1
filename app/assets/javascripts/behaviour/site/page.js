/*********************************************************************************************************************
 *
 * Side-loaded page stuff.
 *
 *********************************************************************************************************************/

const ajax = require( 'util/ajax' );
const rebind = require( 'core/behaviours' ).bind;
const lazyload = require( 'util/lazyload' );

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
        // 1. update the title
        elTitle.textContent = oData.title;

        // 2. remove all existing content + insert anew
        while ( elContent.firstChild !== null )
        {
            elContent.firstChild.remove();
        }
        elContent.insertAdjacentHTML( 'afterbegin', oData.content );

        // 3. retrigger behaviours within the new content
        rebind( elContent );
        bindLinks( elContent ); // eslint-disable-line no-use-before-define
        lazyload( elContent );

        // 4. update the nav
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

        // 5. remove loading class, remove any focussed element, and scroll to the top
        elRoot.classList.remove( 'js-loading' );
        document.activeElement.blur();
        window.scrollTo( 0, 0 );

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
            content: elContent.innerHTML
        }

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

        // 2. class±
        elRoot.classList.add( 'js-loading' );
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

        // 3. bind links
        bindLinks( elRoot );

        // 3. bind popstate
        window.addEventListener( 'popstate', popState );

    }());
}

module.exports = {
    name: 'page',
    init: Page
};
