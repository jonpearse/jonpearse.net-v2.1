/*********************************************************************************************************************
*
* WYSIWYG behaviour for the CMS: binds MediumEditor to things.
*
*********************************************************************************************************************/

const icon          = require( 'util/icons').string;
const Editor        = require( 'util/wysiwyg/wysiwyg' );
const mediaButton   = require( 'util/wysiwyg/plugins/media-button' );
const sourceButton  = require( 'util/wysiwyg/plugins/view-source' );
const textileButton = require( 'util/wysiwyg/plugins/textile' );

// define our toolbar buttons: doing this this way so we can provide our own icons
const EDITOR_BUTTONS = [
  {
    name:       'h2',
    action:     'append-h2',
    aria:       'Second-level heading',
    tagNames:   [ 'h2' ],
    contentDefault:  icon('h2')
  },
  {
    name:       'h3',
    action:     'append-h3',
    aria:       'Third-level heading',
    tagNames:   [ 'h3' ],
    contentDefault:  icon('h3')
  },
  '|',
  {
    name:       'bold',
    action:     'bold',
    aria:       'Make text bold',
    tagNames:   [ 'strong', 'b' ],
    contentDefault:  icon('bold')
  },
  {
    name:       'italic',
    action:     'italic',
    aria:       'Make text italic',
    tagNames:   [ 'italic', 'i' ],
    contentDefault:  icon('italic')
  },
  {
    name:       'anchor',
    action:     'createLink',
    aria:       'Create link',
    tagNames:   [ 'a' ],
    contentDefault:  icon('link'),
    formSaveLabel: icon('check'),
    formCloseLabel: icon('times')
  },
  '|',
  {
    name:       'unorderedlist',
    action:     'insertunorderedlist',
    aria:       'Create unordered list',
    tagNames:   [ 'ul' ],
    contentDefault:  icon('list-ul')
  },
  {
    name:       'orderedlist',
    action:     'insertorderedlist',
    aria:       'Create ordered list',
    tagNames:   [ 'ol' ],
    contentDefault:  icon('list-ol')
  },
  'blockquote',
  '|',
  'media',
  '|',
  {
    name:       'removeFormat',
    action:     'removeFormat',
    aria:       'Remove formatting',
    contentDefault:  icon('eraser')
  },
  '|',
  'source',
  'textile'
];

/**
* The actual WYSIWYG behaviour. This constructs an editor using all of the above and wraps it around a TEXTAREA.
*
* @param  {HTMLElement} elInput - the input to turn into a WYSIWYG
* @param  {Object} options - the options to use when constructing the editor
* @return {null} null
*/
function Wysiwyg( elInput, options )
{
  let elWrapper;

  /**
  * Create the editor.
  */
  function createEditor()
  {
    new Editor( elInput, {
      // buttonLabels: 'fontawesome',

      // we want things in the wrapper for positioning reasons
      elementsContainer: elWrapper,

      // configure our toolbar
      toolbar: {
        buttons: EDITOR_BUTTONS,
        static: true,
        sticky: false,
        align:  'left'
      },

      // disable the placeholder
      placeholder: {
        text: ''
      },

      // load some extensions
      extensions: {
        'media':    () => mediaButton( options ),
        'source':   sourceButton,
        'textile':  textileButton
      }
    });
  }

  return (function init()
  {
    // 1. wrap the input
    // a. wrapper
    elWrapper = document.createElement('div');
    elWrapper.className = 'medium-editor';
    elInput.parentNode.insertBefore(elWrapper, elInput);

    // b. move things around
    elInput.parentNode.removeChild(elInput);
    elWrapper.appendChild(elInput);

    // 2. construct the editor
    createEditor();
  }());
}

module.exports = {
  name: 'wysiwyg',
  init: Wysiwyg
};
