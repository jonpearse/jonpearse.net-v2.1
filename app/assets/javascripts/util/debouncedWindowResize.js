/*********************************************************************************************************************
 *
 * Debounced window event handler. Binds to the window once, calls things many times.
 *
 *********************************************************************************************************************/

let bMainEventBound = false;
let oTo = null;

const DEBOUNCE_TIMEOUT = 100;

/**
 * Triggers the event to which everything else listens.
 */
function triggerEvent()
{
  document.body.dispatchEvent( new CustomEvent( 'debouncedResize' ));
}

/**
 * Binds the main debounced event handler.
 */
function bindMainEvent()
{
  window.addEventListener( 'resize', () =>
  {
    clearTimeout( oTo );
    oTo = setTimeout( triggerEvent, DEBOUNCE_TIMEOUT );
  });

  bMainEventBound = true;
}

module.exports = {
  bind: fn =>
  {
    if ( !bMainEventBound )
    {
      bindMainEvent();
    }

    document.body.addEventListener( 'debouncedResize', fn );
  },
  unbind: fn =>
  {
    if ( !bMainEventBound )
    {
      return;
    }

    document.body.removeEventListener( 'debouncedResize', fn );
  }
}
