/*********************************************************************************************************************
 *
 * Various functions for the stats module.
 *
 *********************************************************************************************************************/

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

module.exports = {
  aggregateData
};
