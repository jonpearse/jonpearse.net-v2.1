const Lazyload = require( 'vendor/lazyload' );
const bFullSupport = ( window.IntersectionObserver !== undefined);
const bNoSupport = !bFullSupport && !( 'sizes' in document.createElement( 'img' ));

/**
* Semi-polyfill for a lack of srcset support, because even a gronky image is better than none at all.
*
* @param {HTMLImageElement} elImg - the image element to fix.
*/
function fixSrcset( elImg )
{
  // work out our current width (don’t worry with constant updates)
  const iWidth = elImg.clientWidth;

  // get a list of sources, in descending size order
  const asSources = elImg.getAttribute( 'srcset' ).split( ',' ).map( sSrc =>
  {
    const [ , src, width ] = sSrc.trim().match( /^(\S+) (\d+)w$/ );
    return {
      source: src,
      width:  parseInt( width, 10 )
    }
  }).filter( oSz => ( oSz.width > iWidth )).sort(( oA, oB ) => ( oB.width - oA.width )).map( oSz => oSz.source );

  // if we have a size, update it
  if ( asSources.length > 0 )
  {
    elImg.src = asSources[0];
  }
}

/**
* Performs a static (non-incremental) load of images on browsers that don’t support the main lazyloader.
*
* @param {HTMLElement} elDom - the element we’re loading images within.
*/
function staticLoad( elDom )
{
  elDom.querySelectorAll( 'img[data-srcset]:not(.-loaded).lazyload' ).forEach( elImg =>
  {
    elImg.setAttribute( 'srcset', elImg.getAttribute( 'data-srcset' ));
    elImg.classList.add( '-loaded' );

    ( bNoSupport && fixSrcset( elImg ));
  })
}

module.exports = ( elRoot = document.body ) =>
{
  if ( window.IntersectionObserver === undefined )
  {
    staticLoad( elRoot );
  }
  else
  {
    new Lazyload({
      container:     elRoot,
      class_initial: '-initial',
      class_loading: '-loading',
      class_loaded:  '-loaded',
      class_error:   '-failed',
      callback_error: el => el.removeAttribute( 'srcset' )
    });
  }
}
