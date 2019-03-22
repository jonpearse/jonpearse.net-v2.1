/*********************************************************************************************************************
*
* Media Library JS
*
*********************************************************************************************************************/

const ajax   = require( 'util/ajax' );
const utils  = require( 'util/dom-utils' );
const icon   = require( 'util/icons' ).icon;
const FX     = require( 'util/fx' );
const render = require( 'util/render-html' );

function MediaLibrary( elRoot, options )
{
  let elContent = null;
  let elUpload = null;
  let elField = null;
  let elProgress = null;
  let sTemplate  = null;

  // state holder
  let iToUpload = 0;
  let iUploaded = 0;
  const aUploadQueue = [];
  let bUploading = false;
  let oUploadInt = null;

  /** UPLOAD FUNCTIONALITY */
  /**
  * Called when a file has been uploaded: increments the counter.
  *
  * @param {Object} oData - the description of the file in the CMS.
  */
  function fileUploadComplete( oData )
  {
    // create a new DOM element from our template
    let elTmp = utils.create( 'div' );
    elTmp.innerHTML = render( oData, sTemplate );

    // append the result
    elContent.insertBefore( elTmp.firstElementChild, elContent.firstElementChild );
    elTmp = null;

    // update things
    iUploaded++;
    elProgress.value = iUploaded;
    if (iToUpload === iUploaded)
    {
      elUpload.classList.remove( '-uploading' );
    }

    // set a timeout on loading the image
    setTimeout( () =>
    {
      console.log( 'Pinging request' );
      ajax( `${oData._urls.show}.json` ).then( oJson =>
      {
        const elImg = elContent.querySelector( `[data-media-id='${oData.id}'] img` );
        elImg.src = oJson.cms_image_url;
        elImg.classList.remove( '-loading' );
      })
    }, 1000 );
  }

  /**
  * Begins to upload the first item on the list.
  */
  function fireUpload()
  {
    // 1. if there’s nothing left to do, clear the upload timer
    if ( aUploadQueue.length === 0 )
    {
      bUploading = false;
      clearInterval( oUploadInt );
      return;
    }

    // 2. otherwise, grab the first file and use its details to populate some FormData
    const oFile = aUploadQueue.shift();
    const oData = new FormData();
    oData.append( 'content[file]', oFile );
    oData.append( 'content[title', oFile.name );

    // 3. pass off to the AJAX request
    ajax( options.endpoint, oData, 'POST' ).then( fileUploadComplete ).catch( () =>
    {
      iToUpload--;
      elProgress.max = iToUpload;

      if (iToUpload === iUploaded)
      {
        elUpload.classList.remove( '-uploading' );
      }
    });
  }

  /** EVENT HANDLING */
  /**
  * Starts the upload process.
  *
  * @param {FileList} files - the files that’re being uploaded
  */
  function startUpload( files )
  {
    // 1. set some initial state
    iToUpload += files.length;
    elProgress.max = iToUpload;
    if (iUploaded === 0)
    {
      elProgress.removeAttribute( 'value' );
    }
    else
    {
      elProgress.value = iUploaded;
    }

    // 2. switch the classes around
    elUpload.classList.add( '-uploading' );

    // 3. push files onto the upload queue
    for ( let i = 0; i < files.length; i++ )
    {
      aUploadQueue.push( files.item( i ));
    }

    // 4. start things off, if not already started
    if ( !bUploading )
    {
      bUploading = true;
      oUploadInt = setInterval( fireUpload, 250 );
    }
  }

  /** DOM-building functionality */
  /**
  * Builds the upload form onto which people can drop files to be uploaded.
  */
  function buildUploadForm()
  {
    // 1. create the form
    elUpload = utils.create( 'form', { class: 'media-upload', method: 'post', action: options.endpoint, style: 'display: none;' });
    elContent.parentNode.insertBefore( elUpload, elContent );

    // 2. create some prompt text
    const elPrompt = utils.create( 'p', { class: 'media-upload__prompt' }, options.prompt );
    elPrompt.appendChild( icon( 'cloud-down' ));
    elUpload.appendChild( elPrompt );

    // 3. … or select
    const elLabel = utils.create( 'label', { for: 'media-upload__select-file', class: 'media-upload__label btn' }, options.orSelect );
    elField = utils.create( 'input', { type: 'file', id: 'media-upload__select-file', class: 'media-upload__input a11y' });
    elUpload.appendChild( elLabel );
    elUpload.appendChild( elField );

    // 4. close button
    const elClose = utils.create( 'button', { type: 'button', class: 'media-upload__close' });
    elClose.appendChild( icon( 'times' ));
    elUpload.appendChild( elClose );

    // 4b. also bind close button here
    elClose.addEventListener( 'click', () =>
    {
      elUpload.classList.add( '-open' );
      FX.slideUp( elUpload );
    })

    // 5. add a progress bar
    const elStatus = utils.create( 'div', { class: 'media-upload__status' });
    elStatus.appendChild( utils.create( 'p', { class: 'media-upload__status-text' }, options.uploading ));
    elProgress = utils.create( 'progress', { class: 'media-upload__progress' });
    elStatus.appendChild( elProgress );
    elUpload.appendChild( elStatus );
  }

  /**
  * Binds various events to the upload form.
  */
  function bindEvents()
  {
    // 1. bind to clicking on the 'create' button
    elRoot.querySelector( '[data-create]' ).addEventListener('click', ev =>
    {
      ev.preventDefault();
      FX.slideDown( elUpload ).then( () => elUpload.classList.add( '-open' ));
    });

    // 2. multibind to various drag events on the upload form
    utils.multibind( elUpload, 'drag dragstart dragend dragover dragenter dragleave drop', ev =>
    {
      ev.preventDefault();
      ev.stopPropagation();
    });

    // 3. bind to actual drag/drop stuff
    utils.multibind( elUpload, 'dragenter dragover', () => elUpload.classList.add( '-hover' ));
    utils.multibind( elUpload, 'dragend dragleave drop', () => elUpload.classList.remove( '-hover' ));

    // 4. handle dropping
    elUpload.addEventListener( 'drop', ev => startUpload( ev.dataTransfer.files ));

    // 5. finally, handle the user interacting with the file upload field
    elField.addEventListener( 'change', ev => startUpload( ev.target.files ));
  }

  return (function init()
  {
    // 1. acquire some DOM elements + fail if we can’t find them
    elContent = elRoot.querySelector( '[data-content]' );
    const elTpl = elRoot.querySelector( '[data-template]' );
    if (( elContent === null ) || ( elTpl === null))
    {
      return;
    }
    sTemplate = elTpl.textContent;

    // 2. build the upload form
    buildUploadForm();

    // 3. bind a load of the events
    bindEvents();

  }());
}

module.exports = {
  name: 'media-library',
  init: MediaLibrary,
  defaults: {
    endpoint: '',
    prompt:   'Drop files here to start uploading.',
    orSelect: 'Or select a file',
    uploading: 'Uploading files…'
  }
};
