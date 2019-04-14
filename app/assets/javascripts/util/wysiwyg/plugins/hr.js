/*********************************************************************************************************************
 *
 * Custom button to insert an HR element
 *
 *********************************************************************************************************************/

/**
 *
 *
 * @return {Object} a public API
 */
function HRButton()
{
  let elButton;
  let elContentEditable;
  let oApi = null;

  /**
   * Handles a user clicking on the button. This will replace the current P with an HR.
  */
  function fnHandleClick()
  {
    // 1. get a selection, and ensure that it’s in a useful place
    let oSelection = window.getSelection();
    if (!elContentEditable.contains(oSelection.anchorNode))
    {
      return;
    }

    // 2. insert an HR above the current selection
    oSelection.anchorNode.parentNode.insertBefore( document.createElement( 'hr' ), oSelection.anchorNode );

    // 3. kick the editor
    oApi.base.checkContentChanged(elContentEditable);
    elContentEditable.focus();
  }

  /**
  * Constructor
  */
  function init()
  {
    // 1. create the button
    elButton = document.createElement('button');
    elButton.type = 'button';
    elButton.className = 'medium-editor-action medium-editor-action-quote';
    elButton.innerHTML = 'HR';
    elButton.addEventListener( 'click', fnHandleClick );

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

module.exports = HRButton;
