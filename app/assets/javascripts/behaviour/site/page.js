
/*********************************************************************************************************************
 *
 * Side-loaded page stuff.
 *
 *********************************************************************************************************************/

const ajax = require( 'util/ajax' );
const rebind = require( 'core/behaviours' ).bind;
const lazyload = require( 'util/lazyload' );
const awaitTransition = require( 'util/awaitTransition' );

const DEFAULT_NAVIGATION = {
    append: true,
    query:  null,
    method: 'GET',
    url:    ''
};

function Page( elRoot )
{
    let elNav = null;
    let elTitle = null;
    let elContent = null;

    /**
     * Updates the page with the content returned from an AJAX call.
     *
     * @param {Object} oData - the new page data.
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
            elRoot.dispatchEvent( new CustomEvent( 'navigatedTo', { detail: { url: oData.path }}))

        }).then( () =>
        {
            elContent.classList.remove( '-out' );
            awaitTransition( elContent ).then(() => elContent.classList.remove( '-loading' ));
        });

        // container classes
        elRoot.classList.add( '-js-loaded' );
        elRoot.classList.remove( '-js-loading' );
        setTimeout( () => elRoot.classList.remove( '-js-loaded' ), 500 );
    }

    /**
     * Loads a given URL.
     *
     * @param {Object} oConf - any additional parameters that should be handled.
     * @return {boolean} whether or not the navigation will be successful.
     */
    function navigateTo( oConf )
    {
        // 0. default some stuff
        const { url, method, query, append } = Object.assign( {}, DEFAULT_NAVIGATION, oConf );

        // 1. work out our request URL + some parameters
        const sRequestUrl = ( url === '/' )
            ? 'home.jhtml'
            : ( url.indexOf( '?' ) === -1 ? url + '.jhtml' : url.replace( '?', '.jhtml?' ));

        // 1. request
        ajax( sRequestUrl, query, method )
            .then( updateContent )
            .then(() => ( append && window.history.pushState( {}, elTitle.textContent, url )))
            .catch( () => document.location.href = url );

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
        // eslint-disable-next-line
        elNode.querySelectorAll( 'a:not([href^="http:"]):not([href^="https:"]):not([href^="mailto:"]):not([href^="/m"]):not(.no-ajax)').forEach( elLink =>
        {
            elLink.addEventListener( 'click', ev => ( navigateTo({ url: elLink.pathname + elLink.search }) && ev.preventDefault()));
        });
    }

    /**
     * Handles online/offline events.
     */
    function handleConnectionChange()
    {
        if ( navigator.onLine )
        {
            document.body.classList.add( 'is-online' );
            document.body.classList.remove( 'is-offline' );
        }
        else
        {
            document.body.classList.add( 'is-offline' );
            document.body.classList.remove( 'is-online' );
        }

        document.body.dispatchEvent( new CustomEvent( 'connection-change', { detail: { linkState: navigator.onLine }}));
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

        // 2. bind links + popstate
        bindLinks( elRoot );
        window.addEventListener( 'popstate', () => navigateTo({ url: document.location.pathname, append: false }));
        elRoot.addEventListener( 'navigateTo', ev => navigateTo( ev.detail ));

        // 3. add class
        elContent.classList.add( 'js-page' );

        // 4. handle online/offline stuff
        window.addEventListener( 'online', handleConnectionChange );
        window.addEventListener( 'offline', handleConnectionChange );
        handleConnectionChange();

    }());
}

module.exports = {
    name: 'page',
    init: Page
};
