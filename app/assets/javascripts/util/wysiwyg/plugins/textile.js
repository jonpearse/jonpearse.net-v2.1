/*********************************************************************************************************************
 *
 * Custom button to allow pasting of textile.
 *
 *********************************************************************************************************************/

const createElement = require( 'util/dom-utils' ).create;
const icon          = require( 'util/icons' ).icon;
const textile       = require( 'textile-js' );

/**
 *
 *
 * @param {HTMLElement} elTextbox - the underlying textarea this has been called on, if appropriate
 * @return {Object} a public API
*/
function TextileButton( elTextbox )
{
  let elButton;
  let elContentEditable;
  let oApi = null;
  let elDom = null;
  let elTxBox;

  /**
   * Closes the DOM.
   */
  function closeDOM()
  {
    elTxBox.value = '';
    elDom.close();
  }

  /**
   * Creates our internal DOM.
   */
  function createDOM()
  {
    // 1. create the overlay and outer form
    elDom = createElement( 'dialog', { class: 'wysiwyg-textile' });
    const elForm = createElement( 'form', { class: 'wysiwyg-textile__form' });
    elDom.appendChild( elForm );
    elTextbox.parentNode.appendChild( elDom );

    // 2. create our textbox
    elTxBox = createElement( 'textarea', { class: 'wysiwyg-textile__textbox form__input', placeholder: 'Paste textile here '});
    elForm.appendChild( elTxBox );

    // 3. and a button
    const elSubmit = createElement( 'button', { class: 'wysiwyg-textile__submit btn btn--primary', type: 'button' }, 'Insert' );
    elForm.appendChild( elSubmit );
    elSubmit.addEventListener( 'click', () =>
    {
      // a. convert + insert into the WYSIWYG
      const sHTML = textile.parse( elTxBox.value );
      elTextbox.value = sHTML;
      elContentEditable.innerHTML = sHTML;

      // b. reset everything
      closeDOM();
    });

    // 4. close button
    const elClose = createElement( 'button', { class: 'wysiwyg-textile__close btn btn--smol btn--icon-only', type: 'button' });
    elClose.appendChild( icon( 'times' ));
    elClose.addEventListener( 'click', closeDOM );
    elDom.appendChild( elClose );
  }

  /**
  * Constructor
  */
  function init()
  {
    // 1. create the button
    elButton = document.createElement( 'button' );
    elButton.type = 'button';
    elButton.className = 'medium-editor-action medium-editor-action-source';
    elButton.innerHTML = 'Tx.';
    elButton.addEventListener( 'click', () =>
    {
      if ( elDom === null )
      {
        createDOM();
      }
      setTimeout( () =>
      {
        elDom.showModal();
        elTxBox.focus();
      }, 10 );
    });

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

module.exports = TextileButton;
