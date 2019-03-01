/*********************************************************************************************************************
 *
 * Effects library. This is a wee bit of a shim that provides some jQuery-esque functionality via the Web Animations
 * API
 *
 *********************************************************************************************************************/

const DEFAULT_SPEED = 400;


/**
 * Applies an effect to the specified element. This is a wrapper for CSS animation
 *
 * @param   {HTMLElement}   el          the element we’re effecting
 * @param   {string}        sFxName     the name of the effect to apply (in CSS: fx--#{sFxName} )
 * @param   {integer}       iSpeed      the speed of the animation, in ms
 * @return  {Promise} a promise that is resolved once everything is complete
 */
function _apply(el, sFxName, iSpeed)
{
    return new Promise(resolve =>
    {
        // 1. set an event handler (old-school!)
        function _complete(ev)
        {
            // if it’s not what we’re after…
            if (ev.target !== el)
            {
                return;
            }

            // tidy up
            el.removeEventListener('animationend', _complete);
            el.style.animationDuration = null;
            el.classList.remove(`fx--${sFxName}`);

            // resolve the promise
            resolve();
        }

        // 2. run everything
        el.addEventListener('animationend', _complete);
        if (iSpeed !== null)
        {
            el.style.animationDuration = iSpeed + 'ms';
        }
        el.classList.add(`fx--${sFxName}`);

    });
}

/**
 * Performs a slide animation where the element slides up to nothingness and disappears.
 *
 * @param   {HTMLElement} el - the unfortunate victim
 * @param   {Number} speed - the time (in ms) to run the effect over
 * @return  {Promise} a Promise that is resolved when the effect completes
 */
function slideUp(el, speed = DEFAULT_SPEED)
{
    // 1. set our max height and apply
    el.style.maxHeight = `${el.clientHeight}px`;

    return new Promise( resolve =>
    {
        _apply( el, 'slideUp', speed).then( () =>
        {
            // set hidden, tidy our maxHeight, and return
            el.style.display   = 'none';
            el.setAttribute( 'aria-hidden', 'true' );
            el.style.maxHeight = null;

            resolve();
        });
    });
}

/**
 * Performs a slide animation where the element is revealed.
 *
 * @param   {HTMLElement} el - the unfortunate victim
 * @param   {Number} speed - the time (in ms) to run the effect over
 * @return  {Promise} a Promise that is resolved when the effect completes
 */
function slideDown(el, speed = DEFAULT_SPEED)
{
    // 1. unhide the element
    el.style.display = '';
    el.removeAttribute( 'aria-hidden' );
    el.style.maxHeight = `${el.clientHeight}px`;

    // 1. apply the slide
    return new Promise(resolve =>
    {
        _apply(el, 'slideDown', speed).then(() =>
        {
            el.style.maxHeight = null;
            resolve();
        })
    });
}

/**
 * Fades the specified element in.
 *
 * @param   {HTMLElement} el - the unfortunate victim
 * @param   {Number} speed - the time (in ms) to run the effect over
 * @return  {Promise} a Promise that is resolved when the effect completes
 */
function fadeIn(el, speed = DEFAULT_SPEED)
{
    return new Promise(resolve => _apply(el, 'fadeIn', speed).then(resolve));
}

/**
 * Fades the specified element out.
 *
 * @param   {HTMLElement} el - the unfortunate victim
 * @param   {Number} speed - the time (in ms) to run the effect over
 * @return  {Promise} a Promise that is resolved when the effect completes
 */
function fadeOut(el, speed = DEFAULT_SPEED)
{
    return new Promise(resolve => _apply(el, 'fadeOut', speed).then(resolve));
}

module.exports = { slideUp, slideDown, fadeIn, fadeOut };
