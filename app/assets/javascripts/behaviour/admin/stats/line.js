/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/
/* global MONTHS */

const Chartist = require( 'chartist' );

const ajax = require( 'util/ajax' );
const { generateGraphData } = require( 'util/admin/stats-functions' );

const BUCKET_WIDTH = 20;
const Y_TICKS = 4;

function LineGraph( elRoot, options )
{
  let elContainer;
  let elButtons;
  let oChart = null;

  let oLastQuery = null;

  /**
   * Generates an individual X-Axis label.
   *
   * @param {Integer} iOff - the offset from the beginning date of the data.
   * @param {Object} oBucketConf - the bucket configuration being used.
   * @return {String} an axis label
   */
  function generateXAxisLabel( iOff, oBucketConf )
  {
    // 1. work out when the calendar starts + adjust for our bucketing
    const oDate = new Date( oLastQuery.start );
    const iOffset = oLastQuery.days - ( oBucketConf.bucketWidth * oBucketConf.numBuckets );
    oDate.setDate( oDate.getDate() + iOffset + iOff );

    // 2. output!
    return `${MONTHS[ oDate.getMonth() + 1 ]} ${oDate.getDate()}`;
  }

  /**
   * Redraws the graph.
   *
   * @param {Object} oRawData - the data returned from the API.
   */
  function redraw( oRawData )
  {
    // 0. store the data
    oLastQuery = oRawData.query;

    // 1. get the data
    const { data, options, meta } = generateGraphData( oRawData, Math.ceil( elRoot.clientWidth / BUCKET_WIDTH ), Y_TICKS );

    // 2. specify a linear-interpolation function for the x-axis
    options.axisX = { labelInterpolationFnc: val => generateXAxisLabel( val, meta ) };
    options.fullWidth = true;
    options.chartPadding = {
      top:    10,
      bottom: 5,
      left:   10,
      right:  50
    };

    // 3. either draw or update the graph
    if ( oChart === null )
    {
      oChart = new Chartist.Line( elContainer, data, options );
    }
    else
    {
      oChart.update( data, options, true );
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
    ajax( options.endpoint + `period=${sPeriod}` ).then( redraw ).then( () =>
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

    // 3. patch endpoint + load data
    options.endpoint += ( options.endpoint.indexOf( '?' ) === -1 ) ? '?' : '&';
    loadData( options.period );

    // 4. bind up
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
