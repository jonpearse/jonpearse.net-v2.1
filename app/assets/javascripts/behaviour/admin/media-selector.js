/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

const utils = require( 'util/dom-utils' );
const icon  = require( 'util/icons' ).icon;
const ajax  = require( 'util/ajax' );
const lightbox = require( 'util/lightbox' );
const render   = require( 'util/render-html' );

function MediaSelector( elRoot, options )
{
    let sTemplate;
    let elButton;

    /**
     * Binds an existing instance.
     *
     * @param {HTMLElement} el - the element to bind.
     */
    function bindInstance( el )
    {
        el.querySelector( '[data-remove]' ).addEventListener( 'click', () => el.remove());
    }

    /**
     * Adds a new media item to the selector.
     *
     * @param {Integer} iMediaId - the ID of the new media
     */
    function addInstance( iMediaId )
    {
        // 0. if we’re not in multiple mode
        if (!options.multiple)
        {
            elRoot.querySelectorAll( '[data-media]' ).forEach( el => el.remove() );
        }

        // 1. create new DOM
        const elTmp = utils.create( 'figure', { class: 'media-selector__preload' });
        elRoot.insertBefore( elTmp, elButton );

        // 2. load the DOM
        ajax( options.metaEndpoint.replace( '--ID--', iMediaId )).then( oMedia =>
        {
            // insert and bind some new stuff, remove the temporary element
            elTmp.insertAdjacentHTML( 'beforebegin', render( oMedia, sTemplate ).trim() );
            bindInstance( elTmp.previousSibling );
            elTmp.remove();
        });
    }

    /**
     * Opens the lightbox.
     */
    function openLightbox()
    {
        // open the lightbox
        const lb = lightbox();
        lb.load( options.selectEndpoint );

        // set some defaults
        lb.addFooterAction( options.select, { class: 'secondary' }, elContent =>
        {
            elContent.querySelectorAll( 'input:checked' ).forEach( el => addInstance( el.value ));
            lb.close();
        });
    }

    /**
     * Adds a button allowing the user to add new images.
     */
    function addButton()
    {
        // add a button for adding things
        elButton = utils.create( 'button', { type: 'button', class: 'media-selector__add btn btn--outline' });
        elButton.appendChild( icon( 'plus' ));
        elButton.appendChild( document.createTextNode( options.select ));
        elRoot.appendChild( elButton );

        elButton.addEventListener( 'click', openLightbox );
    }

    return (function init()
    {
        // 1. get a template
        const elTemplate = elRoot.querySelector( '[data-template]' );
        if (elTemplate === null)
        {
            return;
        }
        elTemplate.remove();
        sTemplate = elTemplate.textContent;

        // 2. build additional DOM
        addButton();

        // 3. bind all instances
        elRoot.querySelectorAll( '[data-media]' ).forEach( bindInstance );

    }());
}

module.exports  = {
    name: 'media-selector',
    init: MediaSelector,
    defaults: {
        selectEndpoint: '',
        metaEndpoint: '',
        select: 'Select',
        multiple: false
    }
};
