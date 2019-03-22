/*********************************************************************************************************************
 *
 * Various functions for the stats module.
 *
 *********************************************************************************************************************/

const Chartist = require( 'chartist' );

/**
 * Puts things into buckets (or bins, if you’re that way inclined).
 *
 * @param {Object} oResults - the response from the server
 * @param {Integer} iTargetBuckets - the target number of buckets to have.
 * @return {Array} an array of integers for each bucket
 */
function aggregateData( oResults, iTargetBuckets )
{
  // 1. do some math
  // a. work out our absolute maximum number of buckets, and their width in days
  let iBuckets = Math.min( oResults.query.days, iTargetBuckets );
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

  // 3. flesh things out a wee bit
  return aBucket.map(( iTotal, idx ) =>
  {
    const iOffsetDays = idx * iDaysPerBucket;

    return {
      visitors:   iTotal,
      offsetDays: iOffsetDays,
      widthDays:  iDaysPerBucket,
      offsetPc:   iOffsetDays / ( iTotalDays - 1 )
    }
  });
}

/**
 * Generates data for a graph ready to be passed into Chartist.
 *
 * @param {Object} oData - the data received from the API.
 * @param {Integer} iSegments - how many segments to cast data into
 * @param {Integer} iYTicks - the number of ticks to place on the Y axis.
 * @return {Object} an object containing data and options members.
 */
function generateGraphData( oData, iSegments, iYTicks )
{
  let iMaxYAxis = 0;

  /**
   * Calculates the ticks to place on the Y-axis.
   *
   * @return {Array} the ticks to display on the Y-Axis
   */
  function calculateYAxis()
  {
    // 1. work out what we should be rounding to
    let fLog = Math.log10( iMaxYAxis );
    if (( fLog % 1 ) <= 0.1 )
    {
      // if we’ve only just crossed a boundary, round down
      fLog--;
    }
    const iRound = Math.pow( 10, Math.floor( fLog )) / 2;

    // 2. round our y-axis up
    iMaxYAxis = Math.ceil( iMaxYAxis / iRound ) * iRound;

    // 3. tweak things to make our ticks nicely-round numbers.
    const iTickInterval = Math.ceil(( iMaxYAxis / ( iYTicks - 1)) / iRound ) * iRound;
    iMaxYAxis = iTickInterval * ( iYTicks - 1 );

    // 2. return our values
    return new Array( iYTicks ).fill( 0 ).map(( blah, idx ) => idx * iTickInterval );
  }

  return (function init()
  {
    // 1. aggregate data + get a maximum y-height
    const aoAggregated = aggregateData( oData, iSegments );
    iMaxYAxis = aoAggregated.reduce(( iMax, oP ) => Math.max( iMax, oP.visitors ), 0 );

    // 2. return stuffs
    return {
      data: {
        series: [ aoAggregated.map( oP => oP.visitors ) ]
      },
      options: {
        axisY: {
          type:  Chartist.FixedScaleAxis,
          ticks: calculateYAxis(),
          high:  iMaxYAxis,
          low:   0
        },
        showPoint: false
      },
    }
  }());
}

module.exports = {
  aggregateData,
  generateGraphData
};
