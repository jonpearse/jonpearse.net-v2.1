/*********************************************************************************************************************
 *
 * Inline editor for the website
 *
 *********************************************************************************************************************/

const icon = require('util/icons').icon;
const Editor = require('../wysiwyg');
const ajaxRequest = require('util/ajax');

// define our toolbar buttons: doing this this way so we can provide our own icons
const EDITOR_BUTTONS = [
    {
        name:       'h2',
        action:     'append-h2',
        aria:       'Second-level heading',
        tagNames:   [ 'h2' ],
        contentFA:  icon('h2')
    },
    {
        name:       'h3',
        action:     'append-h3',
        aria:       'Third-level heading',
        tagNames:   [ 'h3' ],
        contentFA:  icon('h3')
    },
    '|',
    {
        name:       'bold',
        action:     'bold',
        tagNames:   [ 'b', 'strong' ],
        aria:       'Make text bold',
        contentFA:  icon('bold')
    },
    {
        name:       'italic',
        action:     'italic',
        tagNames:   [ 'i', 'em' ],
        aria:       'Make text italic',
        contentFA:  icon('italic')
    },
    {
        name:       'anchor',
        action:     'createLink',
        aria:       'Create link',
        tagNames:   [ 'a' ],
        contentFA:  icon('link')
    },
    '|',
    {
        name:       'unorderedlist',
        action:     'insertunorderedlist',
        aria:       'Create unordered list',
        tagNames:   [ 'ul' ],
        contentFA:  icon('list-ul')
    },
    {
        name:       'orderedlist',
        action:     'insertorderedlist',
        aria:       'Create ordered list',
        tagNames:   [ 'ol' ],
        contentFA:  icon('list-ol')
    },
    'blockquote',
    '|',
    {
        name:       'removeFormat',
        action:     'removeFormat',
        aria:       'Remove formatting',
        contentFA:  icon('eraser')
    }
];

/**
 * The actual WYSIWYG stuff.
 *
 * @param {HTMLElement} elRoot - the root element
 * @param {Object} options - the options to use when constructing the editor.
 * @return {null} null
 */
function InlineEditor(elRoot, options)
{
    let elOpen  = null;
    let elSave  = null;
    let elClose = null;

    let oEditor = null;

    /**
     * Dismisses the editor.
     */
    function fnDismissEditor()
    {
        oEditor.destroy();
        elRoot.parentNode.classList.remove('-active');
    }

    /**
     * Tries to save things.
     */
    function fnSaveContent()
    {
        let oData = [];
        oData[options.property] = oEditor.getContent();
        ajaxRequest( options.uri, oData, 'POST' ).then(() => fnDismissEditor()).catch(oJson => console.warn(oJson));
    }

    /**
     * Loads and constructs the editor.
     */
    function fnInitialiseEditor()
    {
        elRoot.parentNode.classList.add('-active');

        // if it’s already there…
        if (oEditor !== null)
        {
            oEditor.setup();
            return;
        }

        // load MediumEditor + init it (async, because webpack)
        oEditor = new Editor( elRoot, { toolbar: { buttons: EDITOR_BUTTONS }});
    }

    function createDOM()
    {
        // 1. create our new wrapper + insert it
        let elWrap = document.createElement('div');
        elWrap.className = 'inline-editor';
        elRoot.parentNode.insertBefore(elWrap, elRoot);

        // 2. redock our element
        elRoot.parentNode.removeChild(elRoot);
        elWrap.appendChild(elRoot);
        elRoot.classList.add('inline-editor__content');

        // 3. construct our buttons
        // a. toolbar
        let elToolbar = document.createElement('div');
        elToolbar.className = 'inline-editor__toolbar';
        elWrap.appendChild(elToolbar);

        // b. buttons
        elOpen = document.createElement('button');
        elOpen.type = 'button';
        elOpen.className = 'inline-editor__button';
        elOpen.appendChild(icon('edit'));
        elOpen.addEventListener('click', fnInitialiseEditor);
        elToolbar.appendChild(elOpen);

        elSave = document.createElement('button');
        elSave.type = 'button';
        elSave.className = 'inline-editor__button';
        elSave.appendChild(icon('tick'));
        elSave.addEventListener('click', fnSaveContent);
        elToolbar.appendChild(elSave);

        elClose = document.createElement('button');
        elClose.type = 'button';
        elClose.className = 'inline-editor__button';
        elClose.appendChild(icon('cross'));
        elClose.addEventListener('click', fnDismissEditor);
        elToolbar.appendChild(elClose);
    }

    /**
     * Constructor logic
     */
    return (function init()
    {
        // sanity-check
        if ((options.property === undefined) || (options.uri === undefined))
        {
            return;
        }

        // construct some DOM
        createDOM();

    }());
}

module.exports = InlineEditor;
