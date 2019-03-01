/*********************************************************************************************************************
 *
 * Tagging interface for the CMS.
 *
 *********************************************************************************************************************/

const icon = require( 'util/icons' ).icon;
const Autocomplete = require( 'util/autocomplete' );
const ajax = require( 'util/ajax' );
const createElement = require( 'util/dom-utils' ).create;

/**
 * Taggable behaviour.
 *
 * @param {HTMLElement} elRoot - the root element on which the behaviour is being bound.
 * @param {object} options - options being passed into the behaviour.
 * @return {void} nothing
 */
function Taggable( elRoot, options )
{
    let elTpl = null;
    let elField = null;
    let elAutocomplete;
    let aiExist = [];
    let bImpendingDelete = false

    /**
     * Performs a search for tags based on the user input.
     *
     * @param {string} sQuery - that which the user searched.
     * @return {Promise} a promise resolved when the search is complete
     */
    function performSearch( sQuery )
    {
        return new Promise(( resolve, reject ) =>
        {
            ajax( options.endpoint, { search: sQuery }).then( oJson => resolve( oJson ), reject );
        });
    }

    /**
     * Handles creation of a new tag in the CMS.
     *
     * @param {String} sTag - the tag as entered
     * @param {HTMLElement} el - the element that represents this tag
     */
    function createNewTag( sTag, el )
    {
        ajax( options.create, { 'content[name]': sTag }, 'POST' ).then( oJson =>
        {
            el.querySelector( 'input' ).value = oJson.id;
            el.classList.remove( '-creating' );

        }).catch(() =>
        {
            el.remove();
        })
    }

    /**
     * Adds a remove button to an existing DOM node.
     *
     * @param {HTMLElement} elExist - the node to add to.
     */
    function addRemoveButton( elExist )
    {
        // 1. create the button
        const elButton = createElement( 'button', { class: 'taggable__remove', type: 'button' });
        elButton.appendChild( icon( 'times' ));
        elExist.appendChild( elButton );

        // 2. work out the ID of the tag + push it onto our existing list
        const iTagId = parseInt( elExist.querySelector( 'input' ).value, 10 );
        aiExist.push( iTagId );

        // 3. bind to clicking the list
        elButton.addEventListener( 'click', () =>
        {
            // a. remove it from the list of existing tags
            aiExist.filter( i => ( i !== iTagId ));

            // b. remove the element
            elExist.remove();

            // c. refocus
            elField.focus();
        });
    }

    /**
     * Adds a tag to the list: this is called when the user selects something in the autocomplete.
     *
     * @param {Object} oNewTag - the new tag to add.
     */
    function addNewTag( oNewTag )
    {
        // 1. cast things
        const bIsNew = ( oNewTag instanceof String );
        const sTag   = bIsNew ? oNewTag : oNewTag._meta.label;
        const iId    = bIsNew ? '' : oNewTag.id;

        // 2. create the new element
        // a. the main container
        const elTag = createElement( 'span', { class: 'taggable__instance' }, sTag );
        elRoot.insertBefore( elTag, elAutocomplete );

        // b. the input to send back to the form
        const elHidden = elTpl.cloneNode();
        elHidden.value = iId;
        elTag.appendChild( elHidden );

        // c. finally, the button
        addRemoveButton( elTag );

        // 3. unset any flags
        bImpendingDelete = false;

        // 4. if it’s new, fire it off to the database
        if ( bIsNew )
        {
            elTag.classList.add( '-creating' );
            createNewTag( sTag, elTag );
        }
    }

    /**
     * Deletes the last tag, but only if marked to do so.
     */
    function deleteLastTag()
    {
        // 0. if the flag isn’t set, set it and bail
        if (!bImpendingDelete)
        {
            bImpendingDelete = true;
            return;
        }

        // 1. find the last available victim
        let elVictim = elRoot.querySelectorAll( '.taggable__instance' );
        elVictim.item( elVictim.length - 1 ).querySelector( 'button' ).click();

        // 2. unset our deletion flag
        bImpendingDelete = false;
    }

    /**
     * Builds the DOM out.
     */
    function buildDOM()
    {
        // 1. create the field
        elField = createElement( 'input', { id: options.id, type: 'search', class: 'taggable__field' });
        elRoot.appendChild( elField );

        // 2. wrap the autocomplete around it
        elAutocomplete = new Autocomplete( elField, {
            search: performSearch,
            select: addNewTag,
            allowCreate: ( options.create !== false ),
            filter: aoResult => aoResult.filter( oR => !aiExist.includes( oR.id ))
        });

        // 3. add a delete button to existing instances
        elRoot.querySelectorAll( '.taggable__instance' ).forEach( addRemoveButton );

        // 4. if the user hits delete twice in the the search field without a value, delete the most recent tag
        elField.addEventListener( 'keyup', ev =>
        {
            if ((ev.keyCode === 8) && (elField.value.trim() === ''))
            {
                deleteLastTag();
                return;
            }

            bImpendingDelete = false;
        });

        // 5. bind focus + blur for accessibility reasons
        elRoot.addEventListener( 'focus', () => elRoot.classList.add( '-focus' ), true );
        elRoot.addEventListener( 'blur', () => elRoot.classList.remove( '-focus' ), true );
    }

    /**
     * Tries to find a template.
     *
     * @return {boolean} true on success, false otherwise
     */
    function acquireTemplate()
    {
        elTpl = elRoot.querySelector( '[data-trigger]' );
        return (elTpl !== null);
    }

    /**
     * Constructor logic.
     */
    return (function init()
    {
        // can we find a template
        if (!acquireTemplate())
        {
            return;
        }

        buildDOM();

    }());
}

module.exports = {
    name: 'taggable',
    init: Taggable,
    defaults: {
        endpoint: '',
        create: false,
        id: ''
    }
}
