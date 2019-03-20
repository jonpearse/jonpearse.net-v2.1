/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

const ajax = require( 'util/ajax' );
const { create, empty } = require( 'util/dom-utils' );

function StatsTable( elRoot, options )
{
  let elContainer;
  let elButtons;

  /**
   * Redraws the graph.
   *
   * @param {Array} aoData - an array of data in K/V pairs
   */
  function updateTable( aoData )
  {
    // empty things out
    empty( elContainer );

    // create the new stuffs
    aoData.forEach( oRow =>
    {
      // a. row
      const elRow = create( 'tr' );
      elContainer.appendChild( elRow );

      // b. TH + content
      if (( oRow.link === null ) || options.unlink )
      {
        elRow.appendChild( create( 'th', { scope: 'row' }, oRow.label ));
      }
      else
      {
        const elTh = create( 'th', { scope: 'row' });
        elRow.appendChild( elTh );
        elTh.appendChild( create( 'a', { href: oRow.link }, oRow.label ));
      }

      // c. TD
      elRow.appendChild( create( 'td', {}, oRow.visitors ));

    });
  }

  /**
   * Event handler when the user clicks on a filter button: loads data from the server.
   *
   * @param {HTMLEvent} ev - the event that triggered us.
   */
  function loadData( ev )
  {
    // update buttons
    elButtons.forEach( el => el.classList.remove( '-current' ));
    ev.target.classList.add( '-current' );

    // get period + request
    const sPeriod = ev.target.dataset.period;
    ajax( options.endpoint + `period=${sPeriod}` ).then( updateTable )
  }

  /** Constructor logic. */
  return (function init()
  {
    // 1. get the container
    elContainer = elRoot.querySelector( '[data-table]' );
    if ( elContainer === null )
    {
      return elContainer;
    }

    // 2. hook filters
    elButtons = elRoot.querySelectorAll( '[data-period]' )
    elButtons.forEach( el => el.addEventListener( 'click', loadData ));

    // 3. patch endpoint
    options.endpoint += ( options.endpoint.indexOf( '?' ) === -1 ) ? '?' : '&';

    // 3. load data
    elRoot.querySelector( `[data-period='${options.period}']` ).click();

  }());
}

module.exports = {
  name: 'statsTable',
  init: StatsTable,
  defaults: {
    endpoint: null,
    period:   '1W',
    unlink:   false
  }
};
