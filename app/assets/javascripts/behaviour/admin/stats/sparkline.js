/*********************************************************************************************************************
 *
 * Sparkline code: broadly similar to the line stuff, but not quite so interactive.
 *
 *********************************************************************************************************************/
/* global STATS_ROOT */

const ajax       = require( 'util/ajax' );
const svgElement = require( 'util/svg-utils' ).element;

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

  return Y_PAD + ( iPc * ( HEIGHT - Y_PAD - Y_PAD ));
}



function Sparkline( elRoot, options )
{
  /**
   * Builds the SVG with the data returned from the API.
   *
   * @param {Array} aoData - sparkline data
   */
  function buildSvg( aoData )
  {
    // 1. create the SVG itself
    const elSvg = svgElement( 'svg', { version: '1.0', viewBox: '0 0 105 30', height: 30, width: 105 });
    elRoot.appendChild( elSvg );

    // 2. work out our min/max
    const iEndX   = closestDay( new Date() );
    const iStartX = iEndX - 14;

    // 3. get a max Y height
    let iMaxV = 0;
    aoData = aoData.results.map( oP =>
    {
      oP.day = closestDay( new Date( oP.date )) - iStartX;
      iMaxV = Math.max( iMaxV, oP.visitors );

      return oP;
    });

    // 3. ranging checks…
    // a. check the beginning
    if ( aoData[0].day !== 0 )
    {
      aoData.unshift({
        day: aoData[0].day - 1,
        visitors: 0
      })
    }

    // b. … and the end
    const oLast = aoData[aoData.length - 1]
    if ( oLast.day !== 14 )
    {
      aoData.push({
        day: oLast.day + 1,
        visitors: 0
      })
    }

    // 4. start plotting a path
    const sPath = `M-5,${getYPos( aoData[0].visitors, iMaxV )} H0 L` + aoData.map( oP =>
    {
      // a. points
      const xPoint = ( oP.day / 14 ) * WIDTH;
      const yPoint = getYPos( oP.visitors, iMaxV );

      // spit out
      return `${xPoint},${yPoint}`;

    }).join( 'L' ) + `H${WIDTH + 5 }V${HEIGHT + 5}H-5Z`;
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
