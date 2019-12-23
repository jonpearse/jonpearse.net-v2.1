/*********************************************************************************************************************
*
* Main site navigation functionality.
*
*********************************************************************************************************************/

const createElement = require( 'util/dom-utils' ).create;

module.exports = {
  name: 'nav',
  init: elRoot =>
  {
    // 1. insert the button
    const elButton = createElement( 'button', { class: 'nav__toggle', type: 'button', title: 'Show/hide navigation' });
    elButton.appendChild( createElement( 'span' ));
    elRoot.insertBefore( elButton, elRoot.firstElementChild );

    // 2. bind to clicking
    elButton.addEventListener( 'click', () => elRoot.classList.toggle( 'js-open' ));

    // 3. bind to navigation
    document.body.addEventListener( 'navigatedTo', () => elRoot.classList.remove( 'js-open' ));

    return {};
  }
}
