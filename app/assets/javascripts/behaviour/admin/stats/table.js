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
      const elTd = create( 'td' );
      elRow.appendChild( elTd );
      elTd.appendChild( create( 'span',  {}, oRow.visitors ));
      elTd.appendChild( create( 'small', {}, `${oRow.percent}%` ));

    });
  }

  /**
   * Event handler when the user clicks on a filter button: loads data from the server.
   *
   * @param {String} sPeriod - the period to update to
   * @param {Boolean} bRetrigger - true to update all other stats, false otherwise
   */
  function loadData( sPeriod, bRetrigger = false )
  {
    // update buttons
    elButtons.forEach( el => el.classList.toggle( '-current', ( el.dataset.period === sPeriod )));

    // pickle off a request
    ajax( options.endpoint + `period=${sPeriod}` ).then( updateTable ).then( () =>
    {
      if ( bRetrigger )
      {
        elRoot.dispatchEvent( new CustomEvent( 'statsRangeChanged', { bubbles: true, detail: { period: sPeriod }}));
      }
    });
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
    elButtons.forEach( el => el.addEventListener( 'click', ev => loadData( el.dataset.period, !ev.altKey )));

    // 3. patch endpoint
    options.endpoint += ( options.endpoint.indexOf( '?' ) === -1 ) ? '?' : '&';

    // 3. load data
    loadData( options.period );

    // 4. also bind up
    elRoot.parentNode.addEventListener( 'statsRangeChanged', ev => loadData( ev.detail.period ));

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
