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

  /**
   * Redraws the graph.
   *
   * @param {Array} aoData - an array of data in K/V pairs
   */
  function updateTable( aoData )
  {
    // 1. empty things out
    empty( elContainer );

    // 2. if there were no results
    if ( aoData.results.length === 0 )
    {
      // a. row
      const elRow = create( 'tr' );
      elContainer.appendChild( elRow );

      // b. td
      elRow.appendChild( create( 'td', { colspan: 2, class: '-empty' }, 'There were no visitors in this period' ));
      return;
    }

    // 3. otherwise, create the new stuffs
    aoData.results.forEach( oRow =>
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

  /** Constructor logic. */
  return (function init()
  {
    // 1. get the container
    elContainer = elRoot.querySelector( '[data-table]' );
    if ( elContainer === null )
    {
      return elContainer;
    }

    // 2. bind on date range changing
    elRoot.addEventListener( 'statsRangeChanged', ev => ajax( options.endpoint, ev.detail ).then( updateTable ));

  }());
}

module.exports = {
  name: 'statsTable',
  init: StatsTable,
  defaults: {
    endpoint: null,
    unlink:   false
  }
};
