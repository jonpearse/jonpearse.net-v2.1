/*********************************************************************************************************************
*
* Navigation functionality.
*
*********************************************************************************************************************/

function Navigation( elRoot )
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
  * Constructor logic.
  */
  (function init()
  {
    // 1. bind to clicking on top-level links\
    elRoot.querySelectorAll( '[data-top-level]' ).forEach( el => el.querySelector( 'a' ).addEventListener( 'click', handleClick ));

    // 2. find whatever’s current
    elCurrent = elRoot.querySelector( '.-current[data-top-level]' );

    // 3. add some transition flags
    elRoot.classList.add( '-transitions' );

    return {};
  }())
}

module.exports = {
  name: 'navigation',
  init: Navigation,
  defaults: {
    menuText: 'Main menu'
  }
};
