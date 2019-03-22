/*********************************************************************************************************************
*
* Content selector script
*
*********************************************************************************************************************/

const create = require( 'util/dom-utils' ).create;
const Autocomplete = require( 'util/autocomplete' );
const ajax = require( 'util/ajax' );
const icon = require( 'util/icons' ).icon;
const render = require( 'util/render-html' );

function ContentSelector( elRoot, options )
{
  let elInstanceContainer;
  let sInstanceTemplate;
  let iInstanceCount = 0;
  let elSearchField;

  /**
  * Checks instance count against whether we want multiple or not
  */
  function checkInstanceCount()
  {
    if ( !options.multiple && iInstanceCount > 0 )
    {
      elRoot.classList.add( '-no-search' );
      elSearchField.setAttribute( 'disabled', true );
    }
    else
    {
      elRoot.classList.remove( '-no-search' );
      elSearchField.removeAttribute( 'disabled' );
    }
  }

  /**
  * Removes an instance.
  *
  * @param {Event} ev - the event that triggered this.
  */
  function removeInstance( ev )
  {
    ev.target.closest( '[data-instance]' ).remove();
    iInstanceCount--;
    checkInstanceCount();
    elSearchField.focus();
  }

  /**
  * Binds a selected instance.
  *
  * @param {HTMLElement} elInstance - the instance to bind.
  */
  function bindInstance( elInstance )
  {
    // add a new button
    const elButton = create( 'button', { type: 'button', class: 'content-select__remove' });
    elButton.appendChild( icon( 'times', { title: 'Remove this instance' }));
    elInstance.appendChild( elButton );

    // bind to clicking
    elButton.addEventListener( 'click', removeInstance );
  }

  /**
  * Adds a new instance to the instance list.
  *
  * @param {Object} oSelected - the object that was selected
  */
  function addNewInstance( oSelected )
  {
    // safety check
    if ( !options.multiple && ( iInstanceCount > 0 ))
    {
      return;
    }

    // insert the new HTML
    elInstanceContainer.insertAdjacentHTML( 'beforeend', render( oSelected, sInstanceTemplate ));
    bindInstance( elInstanceContainer.lastElementChild );
    iInstanceCount++;

    // recount
    checkInstanceCount();
  }

  /**
  * Builds the search interface, which in itself wraps around the autocomplete.
  */
  function buildSearchInterface()
  {
    // 1. add the search field
    elSearchField = create( 'input', { class: 'content-select__search', type: 'search' });
    elRoot.insertBefore( elSearchField, elInstanceContainer );

    // 2. wrap an autocomplete around it
    new Autocomplete( elSearchField, {
      search: sQ => new Promise(( rs, rj ) => ajax( options.endpoint, { search: sQ }).then( oJson => rs( oJson ), rj )),
      select: addNewInstance
    });
  }

  /** Constructor logic */
  return (function init()
  {
    // acquire various DOM stuff
    elInstanceContainer = elRoot.querySelector('[data-instances]');
    const elTpl = document.getElementById( `tpl__content-select__${options.field}` );
    if ((elInstanceContainer === null) || (elTpl === null))
    {
      return;
    }

    // set things up
    sInstanceTemplate = elTpl.innerHTML;
    buildSearchInterface();
    elInstanceContainer.querySelectorAll( '[data-instance]' ).forEach( el =>
    {
      bindInstance(el);
      iInstanceCount++;
    });

    // check the instance count
    checkInstanceCount();

    // add classes
    elRoot.classList.add( 'js-bound' )
    elRoot.classList.add( options.multiple ? '-multiple' : '-single' );

  }());
}

module.exports = {
  name: 'content-select',
  init: ContentSelector,
  defaults: {
    multiple: false
  }
};
