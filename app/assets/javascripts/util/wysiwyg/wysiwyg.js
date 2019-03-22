/*********************************************************************************************************************
*
* Wrapped WYSIWYG functionality.
*
*********************************************************************************************************************/

const Editor = require('medium-editor');
const ToolbarSeparator = require('./plugins/toolbar-separator');
const BQButton    = require('util/wysiwyg/plugins/blockquote');
const mergeOpts   = require('merge-options');
const MediaPositionExtension = require('util/wysiwyg/plugins/media-position');

const DEFAULTS = {
  extensions: {
    '|': ToolbarSeparator,
    'blockquote': BQButton,
    'media-position': MediaPositionExtension
  }
};

function Wysiwyg( elRoot, options )
{
  // construct the editor
  let oEditor;

  /**
  * Utility function that finds + replaces tags within the specified fragment.
  *
  * @param {DocumentFragment} elFrag - the fragment we’re dealing with
  * @param {String} sFindTags - the elements to find
  * @param {String} sReplTags - the elements to replace with
  */
  function findReplaceTags(elFrag, sFindTags, sReplTags)
  {
    elFrag.querySelectorAll(sFindTags).forEach(el =>
    {
      // a. create the new element
      let elNew = document.createElement(sReplTags);

      // b. copy attributes
      el.getAttributeNames().forEach(sAttr => elNew.setAttribute(sAttr, el.getAttribute(sAttr)));

      // c. copy content
      elNew.innerHTML = el.innerHTML

      // d. swap
      el.parentNode.insertBefore(elNew, el);
      el.parentNode.removeChild(el);
    })
  }

  /**
  * Retrieves the content from the WYSIWYG and does a little bit of tidying before returning to the caller.
  *
  * @return {String} the HTML content of the editor.
  */
  function getContent()
  {
    // 1. acquire content + convert it into a fragment
    let elFrag = document.createElement('div');
    elFrag.innerHTML = oEditor.getContent();

    // 2. find and replace all B + I tags
    findReplaceTags(elFrag, 'b', 'strong');
    findReplaceTags(elFrag, 'i', 'em');

    // 3. return
    return elFrag.innerHTML;
  }

  /**
  * Reverse of getContentOut.
  */
  function prepareContent()
  {
    findReplaceTags(elRoot, 'strong', 'b');
    findReplaceTags(elRoot, 'em', 'i');
  }

  /**
  * Performs some options compilation.
  *
  * @return {Object} an options object.
  */
  function compileOptions()
  {
    // a. compile against defaults
    let oCompiled = mergeOpts(DEFAULTS, options);

    // b. if there’re any extensions that’re callable, handle them
    Object.keys(oCompiled.extensions).forEach(k =>
    {
      if (typeof oCompiled.extensions[k] === 'function')
      {
        oCompiled.extensions[k] = new oCompiled.extensions[k](elRoot);
      }
    });

    return oCompiled;
  }

  // constructor
  (function init()
  {
    prepareContent();

    oEditor = new Editor(elRoot, compileOptions());

  }());

  // return a public API
  return {
    // pass things through
    setup: () =>
    {
      prepareContent();
      oEditor.setup();
    },
    destroy: () =>
    {
      elRoot.innerHTML = getContent();
      oEditor.destroy();
    },

    // we intercept this
    getContent: getContent
  }
}

module.exports = Wysiwyg;
