/*********************************************************************************************************************
 *
 * Sparkline code: broadly similar to the line stuff, but not quite so interactive.
 *
 *********************************************************************************************************************/
/* global STATS_ROOT */

const ajax       = require( 'util/ajax' );
const svgElement = require( 'util/svg-utils' ).element;
const { aggregateData } = require( 'util/admin/stats-functions' );

const HEIGHT = 30;
const WIDTH  = 105;
const Y_PAD  = 5;

/**
 * Returns the cloest day to the given date.
 *
 * @param {Date} oDate - the date to round.
 * @return {Integer} a rounded day number.
 */
function closestDay( oDate )
{
  return Math.floor( oDate.getTime() / 1000 / 86400 );
}

/**
 * Returns the Y position of a given point, taking some padding into account.
 *
 * @param {Integer} iCount - the number of visitors
 * @param {Integer} iMax - the maximum number of visitors.
 * @return {Float} the yPosition of the point.
 */
function getYPos( iCount, iMax )
{
  const iPc = 1 - ( iCount / iMax );

  return Math.round( Y_PAD + ( iPc * ( HEIGHT - Y_PAD - Y_PAD )));
}



function Sparkline( elRoot, options )
{
  /**
   * Builds the SVG with the data returned from the API.
   *
   * @param {Object} oResult - sparkline data
   */
  function buildSvg( oResult )
  {
    // 1. create the SVG itself
    const elSvg = svgElement( 'svg', { version: '1.0', viewBox: '0 0 105 30', height: 30, width: 105 });
    elRoot.appendChild( elSvg );

    // 2. aggregate our data into buckets
    const aAggregated = aggregateData( oResult, 14 );
    const iMaxVisitor = aAggregated.reduce(( iMax, oP ) => Math.max( iMax, oP.visitors ), 0 );

    // 3. start plotting
    const sPath = `M-5,${HEIGHT}L` + aAggregated.map( oP =>
    {
      // a. points
      const xPoint = Math.round( oP.offsetPc * WIDTH );
      const yPoint = getYPos( oP.visitors, iMaxVisitor );

      // spit out
      return `${xPoint},${yPoint}`;

    }).join( 'L' ) + `L${WIDTH + 5},${HEIGHT + 5}H-5Z`;
    elSvg.appendChild( svgElement( 'path', { d: sPath }));


  }

  /** Constructor */
  return (function init()
  {
    // 1. if we have no root, bail
    if ( STATS_ROOT === undefined )
    {
      return;
    }

    // 2. bounce off an AJAX request
    options.axis = 'views';
    options.period = '2W';
    ajax( STATS_ROOT, options ).then( buildSvg );

  }());
}

module.exports = {
  name: 'sparkline',
  init: Sparkline,
  defaults: {
    ct: null,
    ci: null
  }
};
