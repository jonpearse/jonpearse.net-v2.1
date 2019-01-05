/*********************************************************************************************************************
 *
 * Custom button for MediumSelector that plugs into the admin media selector.
 *
 *********************************************************************************************************************/

const icon     = require('util/icons').string;
const selector = require('util/admin/media-selector');

/**
 * Custom button that ties into the CMS’ media uploader, so we can select + insert media items.
 *
 * @return {Object} a public API
 */
function MediaButton()
{
    let elButton;
    let elContentEditable;
    let elPlaceholder = null;
    let oApi = null;

    /**
     * Called once the selection process is complete: injects the media item in the appropriate place.
     *
     * @param {object} oMedia - the media description
     */
    function finaliseSelectionProcess(oMedia)
    {
        // 0. if we don’t have a plceholder, bail
        if (elPlaceholder === null)
        {
            return;
        }

        // 1. create the image + insert it
        let elImage = document.createElement('img');
        elImage.className = 'medium-editor-media';
        elImage.setAttribute('data-media-id', oMedia.id);
        elImage.setAttribute('src', oMedia.sizes.cms);
        elContentEditable.insertBefore(elImage, elPlaceholder);

        // 2. nuke the placeholder
        elContentEditable.removeChild(elPlaceholder);
        elPlaceholder = null;

        // 3. poke MediumEditor
        oApi.base.checkContentChanged(elContentEditable);
    }

    /**
     * Begins the process: opens the media selector and injects a placeholder DIV at the point of the cursor.
     */
    /* eslint-disable complexity */
    function startSelectionProcess()
    {
        // 1. start looking for stuff
        let oSelection = window.getSelection();
        let elRef = oSelection.anchorNode || null;
        let bAppend = false;

        // 2. work out a top-level node we should be adding it to
        if ((elRef === null) || !elContentEditable.contains(elRef))
        {
            elRef = elContentEditable;
            bAppend = true;
        }
        else
        {
            elRef = oSelection.anchorNode;
            while ((elRef.parentNode !== null) && (elRef.parentNode !== elContentEditable))
            {
                elRef = elRef.parentNode;
            }
        }

        // 3. look for the next element, and switch to appending if that fails
        if (elRef.nextElementSibling === null)
        {
            bAppend = true;
        }

        // 4. create the new DOM and drop it in
        elPlaceholder = document.createElement('div');
        elPlaceholder.className = 'medium-editor-media -loading';
        if (bAppend)
        {
            elContentEditable.appendChild(elPlaceholder);
        }
        else
        {
            elContentEditable.insertBefore(elPlaceholder, elRef.nextElementSibling);
        }

        // 5. if our reference was empty, delete it
        if (elRef.innerHTML.replace('<br>', '').trim() === '')
        {
            elContentEditable.removeChild(elRef);
        }

        // 6. finally, open the media selector
        selector({}).then( aoMedia => finaliseSelectionProcess( aoMedia[0] ))
    }
    /* eslint-enable complexity */

    function init()
    {
        // 1. construct the button
        elButton = document.createElement('button');
        elButton.type = 'button';
        elButton.className = 'medium-editor-action medium-editor-action-media';
        elButton.innerHTML = icon('image');

        // 2. bind an event handler
        elButton.addEventListener('click', startSelectionProcess);

        // 3. get a reference to the contentEditable element
        elContentEditable = oApi.base.elements[0];
    }

    oApi = {
        init,
        getButton: () => elButton
    };
    return oApi;
}


module.exports = MediaButton;
