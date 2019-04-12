/*********************************************************************************************************************
*
* Simple-ish autocomplete library.
*
*********************************************************************************************************************/

const lock = require( './deadlock' );
const utils = require( './dom-utils' );
const render = require( './render-html' );

// default options
const DEFAULT_OPTIONS = {
  search: () => Promise.resolve( [] ),
  select: () => {},
  filter: oInput => oInput,
  allowCreate: false,
  sTemplate: '{{_meta.label}}'
};

// reset delay
const RESET_DELAY = 100;

function Autocomplete( elSearchField, options )
{
  let elWrapper;
  let elList;
  let oTo;

  /** LIFECYCLE FUNCTIONS */
  /**
  * Resets everything, clearing the input field as necessary.
  *
  * @param {boolean} bClearField - whether or not to clear the field (optional, default false)
  */
  function resetField( bClearField = false )
  {
    if (bClearField)
    {
      elSearchField.value = '';
      elList.innerHTML = '';
      elSearchField.focus();
    }

    elWrapper.classList.remove( '-open' );
  }

  /**
  * Schedules hiding the field: this occurs after a timeout.
  */
  function scheduleReset()
  {
    clearTimeout( oTo );
    oTo = setTimeout( resetField, RESET_DELAY );
  }

  /**
  * Cancels resetting the field.
  */
  function cancelReset()
  {
    clearTimeout( oTo );
  }

  /** SEARCH FUNCTIONS: mostly just delegates. */
  /**
  * Displays results for the given search.
  *
  * @param {array} aoResult - an array containing results
  */
  function displayResults( aoResult )
  {
    // 0. empty the result list
    while (elList.firstElementChild !== null)
    {
      elList.firstElementChild.remove();
    }

    // 1. filter things, just in case the calling implementation needs it
    aoResult = options.filter( aoResult );

    // 2. if there’s nothing to show\
    if ( aoResult.length === 0 )
    {
      resetField();
      return;
    }

    // 3. otherwise, start populating things
    aoResult.forEach( oResult =>
    {
      // a. create the LI
      const elLi = utils.create( 'li', { class: 'autocomplete__result' });
      elLi.resultObject = oResult;
      elList.appendChild( elLi );

      // b. render things in a wrapper
      const elSpan = utils.create( 'span', { class: 'autocomplete__option' });
      elSpan.innerHTML = render( oResult, options.sTemplate );
      elLi.appendChild( elSpan );

      // c. add a button
      const elButton = utils.create( 'button', { class: 'autocomplete__select', type: 'button' }, 'Select' );
      elLi.appendChild( elButton );
    });

    // 4. show everything
    elWrapper.classList.add( '-open' );
  }

  /**
  * Performs a search based on the value of the search field.
  */
  function performSearch()
  {
    // 1. get a search term
    const sSearch = elSearchField.value.trim();

    // 2. sanity check
    if (sSearch === '')
    {
      resetField();
      return;
    }

    // 3. otherwise, run the search
    lock.perform( new Promise( resolve =>
    {
      options.search( sSearch ).then( displayResults ).then( resolve );
    }), `autocomplete__${elSearchField.id}` );
  }


  /** EVENT-HANDLING FUNCTIONS - */
  /**
  * Handles keyup events in the search field.
  *
  * @param {Event} ev - the appropriate event.
  */
  function handleSearchKeyup(ev)
  {
    // 1. if it’s the down arrow, focus on the first result
    if ( ev.keyCode === 40 )
    {
      let elButton = elList.querySelector( '.autocomplete__select' );
      if (elButton !== null)
      {
        elButton.focus();
        return;
      }
    }

    // 2. if it’s an enter key, select the first item.
    if ( ev.keyCode === 13 )
    {
      let elButton = elList.querySelector( '.autocomplete__select' );
      if (elButton !== null)
      {
        elButton.click();
        return;
      }
    }

    // 3. if we’re allowing creation, handle that. @TODO

    // 4. otherwise, trigger a search
    performSearch();
  }

  /**
  * Handles the user keying up on the results list: this only really pays attention to arrow keys
  *
  * @param {Event} ev - the event.
  */
  function handleListKeyup( ev )
  {
    // 1. if it’s not an arrow key, never mind
    if (( ev.keyCode !== 38 ) && ( ev.keyCode !== 40 ))
    {
      return;
    }

    // 2. get our current victim and process summarily.
    const elCurrent = ev.target.closest( '.autocomplete__result' );
    if ( ev.keyCode === 38 )
    {
      if ( elCurrent.previousElementSibling === null )
      {
        elSearchField.focus();
      }
      else
      {
        elCurrent.previousElementSibling.querySelector( '.autocomplete__select' ).focus();
      }
    }
    else
    {
      if ( elCurrent.nextElementSibling !== null )
      {
        elCurrent.nextElementSibling.querySelector( '.autocomplete__select' ).focus();
      }
    }
  }

  /**
  * Handles clicking on an element/button in the list.
  *
  * @param {Event} ev - the event
  */
  function handleListClick( ev )
  {
    // 1. get the current item
    let elCurrent = ev.target.closest( '.autocomplete__result' );

    // 2. all + reset
    options.select( elCurrent.resultObject );
    resetField( true );

    // 3. prevent anything else happening
    ev.preventDefault();
  }

  /** SETUP FUNCTIONS */
  /**
  * Builds out required elements to our DOM.
  */
  function modifyDOM()
  {
    // 1. wrap an element around our search field + set some classes
    elWrapper = utils.create( 'div', { class: 'autocomplete' });
    utils.wrap( elSearchField, elWrapper );
    elSearchField.classList.add( 'autocomplete__search' );

    // 2. create our list
    elList = utils.create( 'ul', { class: 'autocomplete__results' });
    elWrapper.appendChild( elList );
  }

  /**
  * Binds events to the various components.
  */
  function bindEvents()
  {
    // bind things on the search field
    elSearchField.addEventListener( 'keyup', handleSearchKeyup );
    elSearchField.addEventListener( 'keypress', ev =>
    {
      // do this inline as it’s nice and easy
      if ( ev.keyCode === 13)
      {
        ev.preventDefault();
        return false;
      }
    });

    elSearchField.addEventListener( 'focus', cancelReset );
    elSearchField.addEventListener( 'blur',  scheduleReset );

    // add things to the list
    elList.addEventListener( 'keyup', handleListKeyup );
    elList.addEventListener( 'click', handleListClick );
    elList.addEventListener( 'focus', cancelReset, true );
    elList.addEventListener( 'blur',  scheduleReset, true );
  }

  /**
  * Constructor-esque logic.
  */
  return (function init()
  {
    // 1. default our options
    options = Object.assign({}, DEFAULT_OPTIONS, options);

    // 2. modify the DOM
    modifyDOM();

    // 3. bind events to our DOM
    bindEvents();

    // 4. return a reference to our wrapping element so behaviours can bind to it
    return elWrapper;

  }());
}

module.exports = Autocomplete;
