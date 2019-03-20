/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/


const ajax = require( 'util/ajax' );
const svgElement = require( 'util/svg-utils' ).element;
const onResize = require( 'util/debouncedWindowResize' ).bind;

const INDENT = 10;

function LineGraph( elRoot, options )
{
  let elContainer;
  let elButtons;
  let aoData = [];
  let elSvg = null;
  let iLastWidth = 0;

  /**
   * Redraws the graph.
   */
  function redraw()
  {
    // 1. get area dimensions
    const iMaxX = elContainer.clientWidth  - ( 2 * INDENT );
    const iMaxY = elContainer.clientHeight - ( 2 * INDENT );

    // 2. update the SVG + clear its contents
    elSvg.setAttribute( 'viewBox', `0 0 ${iMaxX + ( 2 * INDENT )} ${iMaxY + ( 2 * INDENT )}` );
    while ( elSvg.firstChild !== null )
    {
      elSvg.removeChild( elSvg.firstChild );
    }

    // 3. start drawing stuff
    const sPath = 'M' + aoData.map( oP =>
    {
      // a. work out points
      const xPoint = ( oP.xOffset * iMaxX ) + INDENT;
      const yPoint = ( oP.yOffset * iMaxY ) + INDENT;

      // b. draw circles
      elSvg.appendChild( svgElement( 'circle', {
        cx: xPoint,
        cy: yPoint,
        title: `${oP.label}, ${oP.visitors} hits`
      }));

      // c. return a coordinate
      return `${xPoint} ${yPoint}`;
    });
    elSvg.appendChild( svgElement( 'path', { d: sPath }));
  }

  /**
   * Updates the internal dataset.
   *
   * @param {Object} aoInbound - the inbound data.
   */
  function updateData( aoInbound )
  {
    // 1. map with dates + get maximum Y
    let iMaxVisitors = 0;
    aoData = aoInbound.map( oI =>
    {
      oI.date = new Date( oI.date );
      iMaxVisitors = Math.max( iMaxVisitors, oI.visitors );
      return oI;
    });

    // 2. now find max + min X axis
    let iStartX = aoData[0].date.getTime();
    let iEndX   = aoData[ aoData.length - 1 ].date.getTime();
    let iDeltaX = iEndX - iStartX;

    // 3. map back
    for ( let i = 0; i < aoData.length; i++ )
    {
      aoData[i].xOffset = ( aoData[i].date.getTime() - iStartX ) / iDeltaX;
      aoData[i].yOffset = 1 - ( aoData[i].visitors / iMaxVisitors );
    }
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
    ajax( options.endpoint + `&period=${sPeriod}` ).then( updateData ).then( redraw )
  }

  /** Constructor logic. */
  return (function init()
  {
    // 1. get the container
    elContainer = elRoot.querySelector( '[data-graph]' );
    if ( elContainer === null )
    {
      return elContainer;
    }

    // 2. hook filters
    elButtons = elRoot.querySelectorAll( '[data-period]' )
    elButtons.forEach( el => el.addEventListener( 'click', loadData ));

    // 3. create the SVG
    elSvg = svgElement( 'svg', { class: 'stats__line-graph', version: '1.0' });
    elContainer.appendChild( elSvg );

    // 4. load data
    elRoot.querySelector( `[data-period='${options.period}']` ).click();

    // 5. blah!
    onResize( () =>
    {
      const iNewWidth = document.body.clientWidth;
      if ( iNewWidth === iLastWidth )
      {
        return;
      }
      iLastWidth = iNewWidth;

      redraw();
    });

  }());
}

module.exports = {
  name: 'lineGraph',
  init: LineGraph,
  defaults: {
    endpoint: null,
    period: '1W'
  }
};
