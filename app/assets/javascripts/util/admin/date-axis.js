/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

/* global MONTHS */

const Chartist = require( 'chartist' );
const { element: svgElement } = require( 'util/svg-utils' );
const { create: createEl } = require( 'util/dom-utils' );

/**
 * Adds a number of days to the given date object.
 *
 * @param {Date} oDate - the date itself
 * @param {Integer} iDays - the number of days to add (or subtract)
 * @return {Date} an updated date
 */
function addDays( oDate, iDays = 1 )
{
  oDate.setDate( oDate.getDate() + iDays );
  return oDate;
}

/**
 * Adds a number of months to the given date object.
 *
 * @param {Date} oDate - the date itself
 * @param {Integer} iMonths - the number of months to add (or subtract)
 * @return {Date} an updated date
 */
function addMonths( oDate, iMonths = 1 )
{
  oDate.setMonth( oDate.getMonth() + iMonths )
  return oDate;
}

/**
 * Returns the number of days between the given date objects.
 *
 * @param {Date} oDateA - the first date
 * @param {Date} oDateB - the second date
 * @return {Integer} the number of days between the two dates.
 */
function dateDiff( oDateA, oDateB )
{
  return Math.round(( oDateB.getTime() - oDateA.getTime() ) / ( 1000 * 86400 ));
}

function axisBuilder( oChart, oData )
{
  let elAxisGroup;
  let elLabelGroup;

  let fLabelHeight = 0;
  let fLabelPosition = 0;

  /**
   * Draws an axis at the given location.
   *
   * @param {Float} fOffset - the offset of the axis line
   * @param {String} sClass - any additional class to add
   * @param {Boolean} bExtend - whether or not to extend below the axis line
   */
  function addGridLine( fOffset, sClass = '', bExtend = false )
  {
    const fEndpoint = bExtend ? fLabelHeight + fLabelPosition : oChart.chartRect.y1;

    elAxisGroup.appendChild( svgElement( 'path', {
      class: `ct-grid ct-horizontal ${sClass}`,
      d: `M${(fOffset + oChart.chartRect.x1)},${oChart.chartRect.y2}V${fEndpoint}`
    }));
  }

  /**
   * Draws a label on the graph at the given offset.
   *
   * @param {Float} fOffset - the offset of the label.
   * @param {Float} fWidth - the width of the label
   * @return {SVGElement} the newly-created label element.
   */
  function addLabel( fOffset, fWidth )
  {
    const elFO = svgElement( 'foreignObject', {
      x: fOffset + oChart.chartRect.x1,
      y: fLabelPosition,
      width:  fWidth,
      height: fLabelHeight,
      style: 'overflow:visible'
    });

    elLabelGroup.appendChild( elFO );
    return elFO;
  }

  /**
   * Plots individual days on the graph.
   */
  function plotIndividualDays()
  {
    // 1. work out offset + start point
    const fOffset = oChart.chartRect.width() / ( oData.query.days - 1 );
    const oDate   = new Date( oData.query.start );

    // 2. now iterate!
    for ( let i = 0; i <= oData.query.days; i++ )
    {
      // a. draw the grid
      addGridLine( fOffset * i );

      // b. and a label
      addLabel( fOffset * i, fOffset ).appendChild( createEl(
        'span',
        { class: 'ct-label ct-horizontal' },
        `${MONTHS[oDate.getMonth() + 1]} ${oDate.getDate()}`
      ));

      // c. increment!
      addDays( oDate );
    }
  }

  /**
   * Plots weeks and months on the graph
   */
  function plotWeeksAndMonths()
  {
    // 0. get some stuff that might come in useful
    const iNumDays   = ( oData.meta.bucketWidth * oData.meta.numBuckets ) - 1;
    const iSvgWidth  = oChart.chartRect.width();
    const fWeekWidth = ( 7 / iNumDays ) * iSvgWidth;

    // 1. work out our starting day, and a month location to start
    const oStartDate = addDays( new Date( oData.query.start ), oData.meta.offsetDays );
    let oCurrMonth = new Date( oData.query.finish.replace( /-\d{2}$/, '-01' ));

    // 2. store an offset + start subtracting months
    const aMonthPositions = [];
    while ( oCurrMonth > oStartDate )
    {
      // a. work out an offset, and plot a grid line there
      const fOff = ( dateDiff( oStartDate, oCurrMonth ) / iNumDays ) * iSvgWidth;
      addGridLine( fOff, 'ct-major', true );

      // b. add a label
      addLabel( fOff, fWeekWidth ).appendChild( createEl(
        'span',
        { class: 'ct-label ct-horizontal ct-month' },
        `${MONTHS[ oCurrMonth.getMonth() + 1 ]} ${oCurrMonth.getFullYear()}`
      ));

      // c. shunt for later + shunt our date
      aMonthPositions.push( fOff );
      addMonths( oCurrMonth, -1 );
    }

    // 3. push what would’ve been the next month onto our list + work out how wide to put minor ticks
    aMonthPositions.push(( dateDiff( oStartDate, oCurrMonth ) / iNumDays ) * iSvgWidth );

    // a. start off with days
    let iTickWidth  = ( 1 / iNumDays ) * iSvgWidth;
    const iDayWidth = iTickWidth;
    let iTickEvery  = 1;
    let iLabelEvery = 7;
    let iStopAt     = 32;

    // b. if that fails, try weeks
    if ( iTickWidth < 40 )
    {
      iTickWidth *= 7;
      iTickEvery  = 7;
      iLabelEvery = 2;
      iStopAt     = 28;
    }

    // c. otherwise, fortnights
    if ( iTickWidth < 40 )
    {
      iTickWidth *= 2;
      iTickEvery  = 14;
      iLabelEvery = 28;
    }

    // 4. now unpack some weeks…
    let fLastOff = iSvgWidth;
    aMonthPositions.forEach( fMonthOff =>
    {
      // i. draw individual ticks
      for ( let i = 0; i < iStopAt; i += iTickEvery )
      {
        // a. work out where we are on the viewport + weather we should show anything
        const fPosition = fMonthOff + ( iDayWidth * i );
        const bShow = ( fPosition > 0 ) && ( fPosition < fLastOff ) && ( i > 0 );

        // b. if we’re showing…
        if ( bShow )
        {
          // a. draw a line
          addGridLine( fPosition, 'ct-minor' );

          // b. if we’re drawing a label
          if (( i % iLabelEvery ) === 0 )
          {
            addLabel( fPosition, iTickWidth ).appendChild( createEl(
              'span',
              { class: 'ct-label ct-horizontal ct-dayofmonth' },
              i
            ))
          }
        }
      }

      // ii. store our last offset
      fLastOff = fMonthOff - 10;
    });
  }

  /** Constructor */
  (function init()
  {
    // 1. get hold of SVG bits
    elAxisGroup  = oChart.svg._node.querySelector( '.ct-grids' );
    elLabelGroup = oChart.svg._node.querySelector( '.ct-labels' );

    // 2. do some more maths
    fLabelPosition = oChart.chartRect.y1 + oChart.axisX.options.labelOffset.y;
    fLabelHeight   = oChart.svg._node.clientHeight - fLabelPosition - oChart.chartRect.padding.bottom;

    // 3. split out
    if (( oData.meta.bucketWidth === 1 ) && ( oData.query.days < 21 ))
    {
      plotIndividualDays();
    }
    else
    {
      plotWeeksAndMonths();
    }
  }());
}

function ctDateAxis( options )
{
  return (function ctDateAxis( chart )
  {
    if ( chart instanceof Chartist.Line )
    {
      chart.on( 'created', data => axisBuilder( data, options.fnGetData() ));
    }
  });
}


/**
 * Installer
 *
 * @param {Object} oCh - the current instance of Chartist
 * @return {Function} blah
 */
module.exports = oCh =>
{
  oCh.plugins = oCh.plugins || {};
  oCh.plugins.ctDateAxis = ctDateAxis;

  return ctDateAxis;
};
