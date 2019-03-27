/*********************************************************************************************************************
 *
 * Abstract behaviour for stats date filters.
 *
 *********************************************************************************************************************/

function StatFilters( elRoot, options )
{
  let elButtons;

  /**
   * Triggers a load event.
   *
   * @param {Object} oData - the data to load
   */
  function triggerLoad( oData )
  {
    document.querySelectorAll( '[data-filterable]' ).forEach( el =>
    {
      console.log( el );
      el.dispatchEvent( new CustomEvent( 'statsRangeChanged', { detail: oData }))
    });

    // toggle classes
    const sPeriod = ( oData.period === undefined ) ? 'x' : oData.period;
    elButtons.forEach( el => el.classList.toggle( '-current', el.dataset.period === sPeriod ));
  }

  /** Constructor */
  return (function init()
  {
    // get buttons
    elButtons = elRoot.querySelectorAll( '[data-period]' );

    // bind to clicking on them
    elButtons.forEach( el => el.addEventListener( 'click', () => triggerLoad({ period: el.dataset.period })));

    // fire a default once everything is bound
    document.body.addEventListener( 'allBehavioursBound', () => triggerLoad({ period: options.period }));
  }());
}

module.exports = {
  name: 'stats-filters',
  init: StatFilters,
  defaults: {
    period: '1W'
  }
};
