/*********************************************************************************************************************
 *
 *
 *
 *********************************************************************************************************************/

const icon = require('util/icons').icon;

const BUTTONS = [
    {
        align:  'left',
        button: 'arrow-left'
    },
    {
        align:  'right',
        button: 'arrow-right'
    },
    {
        align:  'full',
        button: 'plugh'
    },
    {
        align:  'breakout',
        button: 'arrows-h'
    }
];

function MediaPositionExtension()
{
    let oApi;
    let oEditor;
    let elDom;
    let elCurrentVictim;

    /**
     * Repositions the toolbar based on the currently-active element.
     */
    function positionToolbar()
    {
        // 1. get top + left
        let iTop = elCurrentVictim.offsetTop;
        let iLeft = elCurrentVictim.offsetLeft;

        // 2. adjust for dimensions
        iTop += elCurrentVictim.scrollHeight;
        iLeft += (elCurrentVictim.scrollWidth / 2);

        // 3. adjust for position of container

        // 4. set it + show it
        elDom.style.top  = `${iTop}px`;
        elDom.style.left = `${iLeft}px`;
        elDom.classList.add('-show');
    }

    function handleButtonPress(sAction)
    {
        // 1. update the IMG
        elCurrentVictim.setAttribute('data-align', sAction);

        // 2. repo the toolbar
        positionToolbar();

        // 3. poke the editor to tell it we’ve done something
        oEditor.checkContentChanged(oEditor.elements[0]);
    }

    function handleEditorClick(ev)
    {
        // 0. stop anything else
        ev.stopImmediatePropagation();
        ev.preventDefault();

        // 1. if we’re clicking off an image
        if (ev.target.nodeName.toLowerCase() !== 'img')
        {
            elDom.classList.remove('-show');
            return;
        }

        // 2. position the toolbar
        elCurrentVictim = ev.target;
        positionToolbar();
    }

    function createToolbar()
    {
        // 1. create containing element + append it appropriately
        elDom = document.createElement('div');
        elDom.id = `medium-editor-media-position-${oApi.base.id}`;
        elDom.className = 'medium-editor-toolbar medium-editor-media-position';
        oEditor.options.elementsContainer.appendChild(elDom);

        // 2. build out everything else
        let elList = document.createElement('ul');
        elList.className = 'medium-editor-toolbar-actions';
        elDom.appendChild(elList);

        // 3. options!
        BUTTONS.forEach(oButt =>
        {
            // a. button
            let elButton = document.createElement('button');
            elButton.className = `medium-editor-action medium-editor-button-media-align--${oButt.align}`;
            elButton.type = 'button';
            elButton.appendChild(icon(oButt.button));

            // b. item
            let elItem = document.createElement('li');
            elItem.appendChild(elButton);
            elList.appendChild(elItem);

            // c. event handling
            elButton.addEventListener('click', () => handleButtonPress(oButt.align));
        });
    }

    oApi = {
        init: () =>
        {
            // alias the editor
            oEditor = oApi.base;

            // create the toolbar
            createToolbar();

            // bind to clicking on the editor
            oEditor.subscribe('editableClick', handleEditorClick);

        },
        getInteractionElements: () => elDom
    };

    return oApi;
}

module.exports = MediaPositionExtension;
