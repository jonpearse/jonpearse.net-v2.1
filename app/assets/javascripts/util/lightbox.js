/*********************************************************************************************************************
*
* Lightbox code
*
*********************************************************************************************************************/

const ajax  = require( './ajax' );
const utils = require( './dom-utils' );
const icon  = require( './icons' ).icon;

function Lightbox()
{
  let elDom;
  let elHeader;
  let elContent;
  let elFooter;

  const aFooterActions = [];

  /**
  * Takes content from the lightbox and dumps it somewhere else.
  *
  * @param {HTMLElement} el - the content to extract
  * @param {HTMLElement} elVictim - where to add it.
  */
  function appendContentTo( el, elVictim )
  {
    // 1. copy classes
    el.classList.forEach( sClass =>
    {
      elVictim.classList.add( sClass );
      elVictim.classesToRemove.push( sClass );
    });

    // 2. copy content
    while ( el.firstElementChild !== null )
    {
      elVictim.appendChild( el.firstElementChild );
    }

    // 3. remove the original
    el.remove();
  }

  /**
  * Marshalls content from the AJAX request into the lightbox.
  *
  * @param {String} sHtml - the inbound HTML.
  */
  function marshallContent( sHtml )
  {
    // 1. set the content of the content
    elContent.innerHTML = sHtml;

    // 2. bind any behaviours
    require( 'core/behaviours' ).bind( elContent );

    // 3. move things around
    elContent.querySelectorAll( '[data-lightbox-target]' ).forEach( el =>
    {
      switch ( el.getAttribute( 'data-lightbox-target' ).toLowerCase())
      {
        case 'top':
        case 'header':
          appendContentTo( el, elHeader );
          break;
        case 'bottom':
        case 'footer':
          appendContentTo( el, elFooter );
          break;
      }
    });

    // 4. update any links to load within the lightbox
    const reload = ev =>
    {
      ev.preventDefault();
      load( ev.target.href ); // eslint-disable-line
    }
    elDom.querySelectorAll( 'a:not([data-lightbox-nobind])' ).forEach( el => el.addEventListener( 'click', reload ));

    // 5. add footer actions
    aFooterActions.forEach( el => elFooter.appendChild( el ));
  }

  /**
  * Clears and unmarshalls all existing content.
  */
  function clearContent()
  {
    // empty the content
    utils.empty( elContent );

    // empty the header
    elHeader.classesToRemove.forEach( sC => elHeader.classList.remove( sC ));
    elHeader.classesToRemove = [];
    utils.empty( elHeader );

    // empty the footer
    elFooter.classesToRemove.forEach( sC => elFooter.classList.remove( sC ));
    elFooter.classesToRemove = [];
    utils.empty( elFooter );
  }

  /**
  * Opens/shows the lightbox.
  */
  function open()
  {
    elDom.showModal();
    elDom.classList.add( '-open' );
  }

  /**
  * Closes/hides the lightbox.
  */
  function close()
  {
    elDom.classList.remove( '-open' );
    elDom.close();
  }

  /**
  * Loads content from the given URL and shows the lightbox.
  *
  * @param {String} sUrl - the URL to load.
  */
  function load( sUrl )
  {
    // 1. show + empty the lightbox
    clearContent();
    open();
    elDom.classList.add( '-loading' );

    // 2. load the URL
    ajax( sUrl, null, { bJson: false }).then( marshallContent ).then( () => elDom.classList.remove( '-loading' ));
  }

  /**
  * Builds the required DOM elements.
  */
  function buildDom()
  {
    // main container
    elDom = utils.create( 'dialog', { class: 'lightbox', 'aria-hidden': 'true' });
    document.body.appendChild( elDom );

    // header
    elHeader = utils.create( 'header', { class: 'lightbox__header' });
    elHeader.classesToRemove = [];
    elDom.appendChild( elHeader );

    // content
    elContent = utils.create( 'div', { class: 'lightbox__content' });
    elDom.appendChild( elContent );

    // footer
    elFooter = utils.create( 'footer', { class: 'lightbox__footer' });
    elFooter.classesToRemove = [];
    elDom.appendChild( elFooter );

    // close button
    const elClose = utils.create( 'button', { class: 'lightbox__close', type: 'button' });
    elClose.appendChild( icon( 'times' ));
    elClose.addEventListener( 'click', close );
    elDom.appendChild( elClose );
  }

  return (function init()
  {
    buildDom();

    /* return a public API */
    return {
      // expose inner methods
      open,
      close,

      /**
      * Wrapper for internal load that resets some internal states while we’re at it.
      *
      * @param {string} sUri - the URL to open.
      */
      load: sUri =>
      {
        aFooterActions.length = 0;
        load( sUri );
      },

      /**
      * Adds a footer action.
      *
      * @param {string} sLabel - the label to add
      * @param {Object} options - any options to add
      * @param {function} fnClick - the function to be called when the action is clicked
      */
      addFooterAction: ( sLabel, options = {}, fnClick = null ) =>
      {
        // set some options
        let aClasses = [ 'btn' ];
        if (options.class !== undefined)
        {
          options.class.split( /\s+/ ).forEach( sC => aClasses.push( `btn--${sC}` ));
        }
        options.class = aClasses.join( ' ' );
        options.type  = 'button';

        // create the button + bind clicking
        const elButton = utils.create( 'button', options, sLabel );
        elButton.addEventListener( 'click', () => fnClick( elContent ));

        // dump it in the array
        aFooterActions.push( elButton );
      }
    };

  }());
}

let oInstance = null;
module.exports = () =>
{
  if (oInstance === null)
  {
    oInstance = new Lightbox();
  }

  return oInstance;
}
