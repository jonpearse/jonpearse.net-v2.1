/*********************************************************************************************************************
 *
 * Navigation functionality.
 *
 *********************************************************************************************************************/

const icon = require( 'util/icons' ).icon;

function Navigation( elRoot, options )
{
    let elCurrent;

    /**
     * Handles clicking on a top-level item to open its menu.
     *
     * @param {Event} ev - the click event.
     */
    function handleClick( ev )
    {
        // 1. get the menu item
        const elMenuItem = ev.target.closest( '[data-top-level]' );

        // 2. if it doesn’t have children, then never mind
        if ( !elMenuItem.classList.contains( '-has-sub' ))
        {
            return;
        }

        // 3. otherwise, if we have a current item…
        if ( elCurrent !== null )
        {
            elCurrent.classList.remove( '-current' );
        }

        // 4. add it to the new victim + interrupt the normal flow of things
        elCurrent = elMenuItem;
        elMenuItem.classList.add( '-current' );
        ev.preventDefault();
    }


    /**
     * Closes a menu: called by clicking on a close button in the subnav.
     */
    function closeMenu()
    {
        elCurrent.classList.remove( '-current' );
        elCurrent.querySelector( 'a' ).focus();

        elCurrent = null;
    }

    /**
     * Creates additional DOM on submenus.
     *
     * @param {HtmlElement} elSub - the submenu we’re looking at
     */
    function addAdditionalDOM( elSub )
    {
        // 1. create the button
        const elButton = document.createElement( 'button' );
        elButton.classList.add( 'main-navigation__close-button' );
        elButton.type = 'button';
        elButton.appendChild( icon( 'double-left' ));
        elButton.appendChild( document.createTextNode( options.menuText ));
        elSub.appendChild( elButton );

        // 2. bind to clicking
        elButton.addEventListener( 'click', closeMenu );
    }

    /**
     * Constructor logic.
     */
    (function init()
    {
        // 1. create some additional DOM
        elRoot.querySelectorAll( '[data-sub-nav]' ).forEach( addAdditionalDOM );

        // 2. bind to clicking on top-level links\
        elRoot.querySelectorAll( '[data-top-level]' ).forEach( el => el.querySelector( 'a' ).addEventListener( 'click', handleClick ));

        // 3. find whatever’s current
        elCurrent = elRoot.querySelector( '.-current[data-top-level]' );

        // 4. add some transition flags
        elRoot.classList.add( '-transitions' );

    }())
}

module.exports = {
    name: 'navigation',
    init: Navigation,
    defaults: {
        menuText: 'Main menu'
    }
};
