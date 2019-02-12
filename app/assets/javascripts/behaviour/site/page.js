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
     * @param {String} sUrl - the URL
     * @param {Boolean} bAppend - whether or not to append to the history
     * @return {boolean} whether or not the navigation will be successful.
     */
    function navigateTo( sUrl, bAppend = true )
    {
        // 0. work out the request URL
        let sRequestUrl = ( sUrl === '/' )
            ? 'home.jhtml'
            : ( sUrl.indexOf( '?' ) === -1 ? sUrl + '.jhtml' : sUrl.replace( '?', '.jhtml?' ));

        // 1. request
        ajax( sRequestUrl )
            .then( updateContent )
            .then(() => ( bAppend && window.history.pushState( {}, elTitle.textContent, sUrl )))
            .catch( () => document.location.href = sUrl );

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
        elNode.querySelectorAll( 'a:not([href^="http:"]):not([href^="https:"]):not([href^="mailto:"]):not([href^="/m"])').forEach( elLink =>
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

        // 2. bind links + popstate
        bindLinks( elRoot );
        window.addEventListener( 'popstate', () => navigateTo( document.location.pathname, false ));
        elRoot.addEventListener( 'navigateTo', ev => navigateTo( ev.detail.url ));

        // 3. add class
        elContent.classList.add( 'js-page' );

    }());
}

module.exports = {
    name: 'page',
    init: Page
};
