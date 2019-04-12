/*********************************************************************************************************************
*
* Common media selector API for use elsewhere.
*
*********************************************************************************************************************/
/* global MEDIA_PATHS */

const lightbox = require('util/lightbox');
const ajax =     require('util/ajax');

/**
* Main functionality to be used by other components.
*
* @param  {Object} options - options
* @return {Promise} a promise that is returned when the user selects an image/some images, and rejecetd when they cancel.
*/
const MediaSelector = options => new Promise( fnResolve =>
{
  // create the lightbox
  const lb = lightbox();
  lb.load( MEDIA_PATHS.select );

  // add a select button
  lb.addFooterAction( options.select, { class: 'secondary' }, elContent =>
  {
    const aoRet = [];
    elContent.querySelectorAll( 'input:checked' ).forEach( el => aoRet.push(
      new Promise( res => ajax( MEDIA_PATHS.meta.replace( '{id}', el.value )).then( res ))
    ));

    // close the lightbox and return stuff
    lb.close();
    fnResolve( aoRet );
  });
})

module.exports = MediaSelector;
