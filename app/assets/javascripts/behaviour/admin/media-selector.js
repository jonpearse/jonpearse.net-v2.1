/*********************************************************************************************************************
*
*
*
*********************************************************************************************************************/

const utils  = require( 'util/dom-utils' );
const icon   = require( 'util/icons' ).icon;
const core   = require( 'util/admin/media-selector' );
const render = require( 'util/render-html' );

function MediaSelector( elRoot, options )
{
  let sTemplate;
  let elButton;

  /**
  * Binds an existing instance.
  *
  * @param {HTMLElement} el - the element to bind.
  */
  function bindInstance( el )
  {
    el.querySelector( '[data-remove]' ).addEventListener( 'click', () => el.remove());
  }

  /**
  * Adds a new media item to the selector.
  *
  * @param {object} oSelected - the selected media item
  */
  function addInstance( oSelected )
  {
    // 0. if we’re not in multiple mode
    if (!options.multiple)
    {
      elRoot.querySelectorAll( '[data-media]' ).forEach( el => el.remove() );
    }

    // 1. create new DOM
    const elTmp = utils.create( 'figure', { class: 'media-selector__preload' });
    elRoot.insertBefore( elTmp, elButton );

    // 2. update the DOM once everything’s loaded
    oSelected.then( oMedia =>
    {
      elTmp.insertAdjacentHTML( 'beforebegin', render( oMedia, sTemplate ).trim() );
      bindInstance( elTmp.previousSibling );
      elTmp.remove();
    });
  }

  /**
  * Opens the lightbox.
  */
  function openLightbox()
  {
    core( options ).then( aoSelected => aoSelected.forEach( addInstance ));
  }

  /**
  * Adds a button allowing the user to add new images.
  */
  function addButton()
  {
    // add a button for adding things
    elButton = utils.create( 'button', { type: 'button', class: 'media-selector__add btn btn--outline' });
    elButton.appendChild( icon( 'plus' ));
    elButton.appendChild( document.createTextNode( options.select ));
    elRoot.appendChild( elButton );

    elButton.addEventListener( 'click', openLightbox );
  }

  return (function init()
  {
    // 1. get a template
    const elTemplate = elRoot.querySelector( '[data-template]' );
    if (elTemplate === null)
    {
      return;
    }
    elTemplate.remove();
    sTemplate = elTemplate.textContent;

    // 2. build additional DOM
    addButton();

    // 3. bind all instances
    elRoot.querySelectorAll( '[data-media]' ).forEach( bindInstance );

  }());
}

module.exports  = {
  name: 'media-selector',
  init: MediaSelector,
  defaults: {
    select: 'Select',
    multiple: false
  }
};
