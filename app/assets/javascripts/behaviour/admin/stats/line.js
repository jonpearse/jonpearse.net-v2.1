/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

const ajax = require( 'util/ajax' );
const { element: svgElement, text: svgText } = require( 'util/svg-utils' );
const { empty } = require( 'util/dom-utils' );
const { aggregateData } = require( 'util/admin/stats-functions' );
const onResize = require( 'util/debouncedWindowResize' ).bind;

const BUCKET_WIDTH = 40;
const INDENT = {
  top:    10,
  bottom: 30,
  left:   40,
  right:   5
};

const Y_TICKS = 4;

function LineGraph( elRoot, options )
{
  let elContainer;
  let elButtons;

  let elSvg = null;
  let iLastWidth = 0;

  let oLastResult;

  /**
   * Plots the Y-axis on the graph.
   *
   * @param {Integer} iMaxY - the maximum Y value that we need to hit
   * @param {Object} oBounds - the bounds of the drawable area
   * @return {SVGElement} a G node containing the axis + labels
   */
  function plotYAxis( iMaxY, oBounds )
  {
    // 1. do some maths!
    // a. work out our rounding factor: this should be half of whatever 2sf is
    let fLog   = Math.log10( iMaxY );
    if (( fLog % 1 ) <= 0.1 )
    {
      // if we’re only just above a power of 10, go for the previous rounding factor instead.
      fLog--;
    }
    const iRound = Math.pow( 10, Math.floor( fLog )) / 2;

    // b. now round things: this gives our first idea of what the axis maximum might be
    let iAxisMax = Math.ceil( iMaxY / iRound ) * iRound;

    // c. now: work out a nice round number for our tick interval based off this + use that to recalulate
    let iTickInterval = Math.ceil(( iAxisMax / ( Y_TICKS - 1 )) / iRound ) * iRound;
    iAxisMax = iTickInterval * ( Y_TICKS - 1 );
    const iTickDistance = oBounds.height / ( Y_TICKS - 1 );

    // 2. awesome: start drawing things. First a group
    const elGroup = svgElement( 'g', { class: 'axis -y' });

    // 3. now start drawing each line + label
    const sPath = 'M' + ( new Array( Y_TICKS ).fill( 0 )).map(( blah , idx ) =>
    {
      // a. work out a Y position
      const yPos = ( iTickDistance * idx ) + oBounds.top;

      // b. draw some text
      elGroup.appendChild( svgText( iAxisMax - ( idx * iTickInterval ), { x: oBounds.left, y: yPos }));

      // c. return a point for the line
      return `${oBounds.left},${yPos}h${oBounds.width}`;
    }).join( 'M' );
    elGroup.appendChild( svgElement( 'path', { d: sPath }));

    return { group: elGroup, newMax: iAxisMax };
  }

  /**
   * Plots the actual line on the graph.
   *
   * @param {Array} aoData - the data to plot
   * @param {Integer} iMaxY - the maximum of the Y-axis
   * @param {Object} oBounds - the bounds within which to draw things
   * @return {SVGElement} a PATH node describing the line
   */
  function plotLine( aoData, iMaxY, oBounds )
  {
    const sPath = 'M' + aoData.map( oP =>
    {
      // a. work out points
      const xPoint = ( oP.offsetPc * oBounds.width ) + oBounds.left;
      const yPoint = (( 1 - ( oP.visitors / iMaxY )) * oBounds.height ) + oBounds.top;

      // b. return a coordinate
      return `${xPoint},${yPoint}`;
    }).join( 'L' );
    return svgElement( 'path', { class: 'plot', d: sPath });
  }

  /**
   * Redraws the graph.
   */
  function redraw()
  {
    // 1. get area dimensions
    const oBounds = {
      top:    INDENT.top,
      left:   INDENT.left,
      width:  elSvg.clientWidth - INDENT.left - INDENT.right,
      height: elSvg.clientHeight - INDENT.top - INDENT.bottom
    };

    // 2. aggregate our data + work out the maximum visitor count
    const aoAggregated = aggregateData( oLastResult, Math.floor( oBounds.width / BUCKET_WIDTH ));
    const iMaxVisitor  = aoAggregated.reduce(( iMax, oP ) => Math.max( iMax, oP.visitors ), 0 );

    // 3. clear the SVG out + set some new info
    empty( elSvg );
    elSvg.setAttribute( 'viewBox', `0 0 ${elSvg.clientWidth} ${elSvg.clientHeight}` );

    // 4. if there’s no data
    if ( oLastResult.results.length === 0 )
    {
      const elText = svgElement( 'text', { x: elSvg.clientWidth / 2, y: elSvg.clientHeight / 2 });
      elText.appendChild( document.createTextNode( 'There were no visitors in this period' ));
      elSvg.appendChild( elText );
      return;
    }

    // 5. plot things
    // plotXAxis();
    const yAxis = plotYAxis( iMaxVisitor, oBounds );
    elSvg.appendChild( yAxis.group );
    elSvg.appendChild( plotLine( aoAggregated, yAxis.newMax, oBounds ));
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
    elSvg = svgElement( 'svg', { version: '1.0' });
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
