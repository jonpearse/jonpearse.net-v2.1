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
    const iMaxX = elSvg.clientWidth  - ( 2 * INDENT );
    const iMaxY = elSvg.clientHeight - ( 2 * INDENT );

    // 2. update the SVG + clear its contents
    elSvg.setAttribute( 'viewBox', `0 0 ${elSvg.clientWidth} ${elSvg.clientHeight}` );
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
   * @param {String} sPeriod - the period to update to
   * @param {Boolean} bRetrigger - true to update all other stats, false otherwise
   */
  function loadData( sPeriod, bRetrigger = false )
  {
    // update buttons
    elButtons.forEach( el => el.classList.toggle( '-current', ( el.dataset.period === sPeriod )));

    // pickle off a request
    ajax( options.endpoint + `period=${sPeriod}` ).then( updateData ).then( redraw ).then( () =>
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
    elContainer = elRoot.querySelector( '[data-graph]' );
    if ( elContainer === null )
    {
      return elContainer;
    }

    // 2. hook filters
    elButtons = elRoot.querySelectorAll( '[data-period]' )
    elButtons.forEach( el => el.addEventListener( 'click', ev => loadData( el.dataset.period, !ev.altKey )));

    // 3. create the SVG
    elSvg = svgElement( 'svg', { class: 'stats__line-graph', version: '1.0' });
    elContainer.appendChild( elSvg );

    // 4. patch viewport + load data
    options.endpoint += ( options.endpoint.indexOf( '?' ) === -1 ) ? '?' : '&';
    loadData( options.period );

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

    // 6. also bind up
    elRoot.parentNode.addEventListener( 'statsRangeChanged', ev => loadData( ev.detail.period ));

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
