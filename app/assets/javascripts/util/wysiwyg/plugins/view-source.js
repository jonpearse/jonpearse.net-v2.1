/*********************************************************************************************************************
 *
 * Custom button to do blockquotes better.
 *
 *********************************************************************************************************************/

const icon = require('util/icons').string;

/**
 *
 *
 * @param {HTMLElement} elTextbox - the underlying textarea this has been called on, if appropriate
 * @return {Object} a public API
 */
function ViewSource(elTextbox)
{
    let elButton;
    let elContentEditable;
    let oApi = null;

    /**
     * Handles a user clicking on the button. This will have one of three effects:
     */
    function fnHandleClick()
    {
        // 1. get a toolbar + work out what we’re doing
        let elToolbar = elButton.closest('.medium-editor-toolbar-actions');
        if (elToolbar === null)
        {
            return;
        }
        let bShowSource = !elButton.classList.contains('medium-editor-button-active');

        // 2. switch button states
        elToolbar.querySelectorAll('button').forEach(el => el.setAttribute('disabled', bShowSource));
        elButton.removeAttribute('disabled'); // ensure we never disable ourselves

        // 2. switch things around
        if (bShowSource)
        {
            // just switch classes
            elContentEditable.classList.add('-switched');
            elTextbox.classList.add('-switched');
        }
        else
        {
            // a. manually update the WYSIWYG
            elContentEditable.innerHTML = elTextbox.value;

            // b. switch classes
            elContentEditable.classList.remove('-switched');
            elTextbox.classList.remove('-switched');
        }

        // 4. toggle class
        elButton.classList.toggle('medium-editor-button-active');
    }

    /**
     * Constructor
     */
    function init()
    {
        // 1. create the button
        elButton = document.createElement('button');
        elButton.type = 'button';
        elButton.className = 'medium-editor-action medium-editor-action-source';
        elButton.innerHTML = icon('code');
        elButton.addEventListener('click', fnHandleClick);

        // 2. get a hook on the contentEditable DIV
        elContentEditable = oApi.base.elements[0];
    }

    // return the API
    oApi = {
        init,
        getButton: () => elButton
    };
    return oApi;
}

module.exports = ViewSource;
