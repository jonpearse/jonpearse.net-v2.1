/*********************************************************************************************************************
 *
 * Simple dark-mode toggle.
 *
 *********************************************************************************************************************/

module.exports = {
  name: 'toggle-dark-mode',
  init: elRoot => elRoot.addEventListener( 'click', ev =>
  {
    // prevent stuff
    ev.preventDefault();

    // toggle CSS
    document.documentElement.classList.toggle( 'dark-mode' );

    // set a cookie
    const sCookieValue = document.documentElement.classList.contains( 'dark-mode' ) ? 'true' : 'false';
    document.cookie = `dark_mode=${ sCookieValue };path=/;max-age=31536000`;

    return {};
  })
}
