/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/


const ajax = require( 'util/ajax' );
const svgElement = require( 'util/svg-utils' ).element;
const { empty } = require( 'util/dom-utils' );
const onResize = require( 'util/debouncedWindowResize' ).bind;

const INDENT = 10;
const BUCKET_WIDTH = 20;

/**
 * Puts things into buckets (or bins, if you’re that way inclined).
 *
 * @param {Object} oResults - the response from the server
 * @param {Integer} iWidth - the total width available to us
 * @return {Array} an array of integers for each bucket
 */
function aggregateData( oResults, iWidth )
{
  // 1. do some math
  // a. work out our absolute maximum number of buckets, and their width in days
  let iBuckets = Math.min( oResults.query.days, Math.floor( iWidth / BUCKET_WIDTH ));
  const iDaysPerBucket = Math.ceil( oResults.query.days / iBuckets );

  // b. now, adjust the number of buckets based on the above
  iBuckets = Math.ceil( oResults.query.days / iDaysPerBucket );
  const iTotalDays = ( iDaysPerBucket * iBuckets );

  // c. finally work out where the first bucket will start respective to our data
  const iOffset = oResults.query.days - iTotalDays;

  // 2. create our buckets + start filling them
  const aBucket = new Array( iBuckets ).fill( 0 );
  oResults.results.forEach( oR =>
  {
    const iBucketId = Math.floor(( oR.offset - iOffset ) / iDaysPerBucket );
    aBucket[iBucketId] += oR.visitors;
  });

  return aBucket.map(( iTotal, idx ) =>
  {
    const iOffsetDays = idx * iDaysPerBucket;
    const fCentrePoint = iOffsetDays + ( iDaysPerBucket / 2 );

    return {
      visitors:   iTotal,
      offsetDays: iOffsetDays,
      widthDays:  iDaysPerBucket,
      offsetPc:   fCentrePoint / iTotalDays
    }
  });
}

function LineGraph( elRoot, options )
{
  let elContainer;
  let elButtons;

  let elSvg = null;
  let iLastWidth = 0;

  let oLastResult;

  /**
   * Redraws the graph.
   */
  function redraw()
  {
    // 1. get area dimensions
    const iMaxX = elSvg.clientWidth  - ( 2 * INDENT );
    const iMaxY = elSvg.clientHeight - ( 2 * INDENT );

    // 2. aggregate our data + work out the maximum visitor count
    const aAggregated = aggregateData( oLastResult, iMaxX );
    const iMaxVisitor = aAggregated.reduce(( iMax, oP ) => Math.max( iMax, oP.visitors ), 0 );

    // 3. clear the SVG out + set some new info
    empty( elSvg );
    elSvg.setAttribute( 'viewBox', `0 0 ${elSvg.clientWidth} ${elSvg.clientHeight}` );

    // 4. start drawing things out
    const sPath = 'M' + aAggregated.map( oP =>
    {
      // a. work out points
      const xPoint = ( oP.offsetPc * iMaxX ) + INDENT;
      const yPoint = (( 1 - ( oP.visitors / iMaxVisitor )) * iMaxY ) + INDENT;

      // b. return a coordinate
      return `${xPoint},${yPoint}`;
    }).join( 'L' );
    elSvg.appendChild( svgElement( 'path', { d: sPath }));
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
    ajax( options.endpoint + `period=${sPeriod}` ).then( oResult => oLastResult = oResult ).then( redraw ).then( () =>
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
    elRoot.parentNode.addEventListener( 'statsRangeChanged', ev =>
    {
      if ( ev.target !== elRoot )
      {
        loadData( ev.detail.period );
      }
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
