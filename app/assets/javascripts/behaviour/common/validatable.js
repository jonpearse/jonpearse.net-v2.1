/*********************************************************************************************************************
*
* HTML5 form validation API.
*
*********************************************************************************************************************/

/**
* Custom valiation logic for either date or month fields.
*
* @param {HTMLElement} el - the field we’re validating, which we can assume at this point is invalid
* @return {String} the validation message to display
*/
function validateDateMonth(el)
{
  if (el.validity.rangeOverflow)
  {
    return 'too_late';
  }
  if (el.validity.rangeUnderflow)
  {
    return 'too_early';
  }
}

/**
* Custom validation function, brought out of FormField for ease of use.
*
* @param {HTMLElement} el - the field we’re validating, which we can assume at this point is invalid
* @return {String} the validation message to display
*/
/* eslint-disable complexity */
function validateCustom(el)
{
  // 1. work out our type
  let sType = el.type.toLowerCase() || el.nodeName.toLowerCase();
  console.debug(sType, el.validity);

  // 2. orf we go…
  switch (sType)
  {
    case 'email':
      return 'not_an_email';
    case 'url':
      return 'url';
    case 'month':
    case 'date':
      return validateDateMonth(el);
  }
  console.debug(el.validity);
  return 'custom';
}
/* eslint-enable complexity */

/**
* Validation helper class for an individual field.
*
* @param {HTMLElement} el - the element we’re validating.
* @return {object} a public API
*/
function FormField(el)
{
  let oErrorMsg;
  let elErrorMsg;
  let elContainer;

  /**
  * Shows an appropriate error message.
  *
  * @param {String} sMessage - the error message to display
  * @return {boolean} false, for chaining purposes
  */
  function showError(sMessage)
  {
    // set the HTML + show
    elErrorMsg.innerHTML = (oErrorMsg[sMessage] !== undefined) ? oErrorMsg[sMessage] : sMessage;
    elErrorMsg.classList.remove('-hide');
    elErrorMsg.removeAttribute('aria-hidden');
    elContainer.classList.add('-error');

    return false;
  }


  /**
  * Checks the current validation state of the field.
  *
  * @return {boolean} whether or not the field is valid.
  */
  function fnValidate()
  {
    // 1. clear the current state
    elErrorMsg.classList.add('-hide');
    elErrorMsg.setAttribute('aria-hidden', 'true');
    elErrorMsg.innerHTML = '';
    elContainer.classList.remove('-error');

    // 2. if we’re valid, return success
    if (el.validity.valid)
    {
      return true;
    }

    // 3. if we’re required, and the field is blank…
    if (el.validity.valueMissing)
    {
      return showError('blank');
    }

    // 4. if there’s a pattern mismatch
    if (el.validity.patternMismatch)
    {
      return showError('invalid');
    }

    // 4. now we get all custom…
    return showError(validateCustom(el));
  }

  /**
  * Creates additional DOM elements around the input.
  */
  function createAdditionalDOM()
  {
    // 1. if we have an error message already, grab that
    elErrorMsg = elContainer.querySelector('.form__error');

    // 2. if it didn’t work
    if (elErrorMsg === null)
    {
      // a. create it
      elErrorMsg = document.createElement('label');
      elErrorMsg.classList.add('form__error');
      elErrorMsg.classList.add('-hide');
      elErrorMsg.setAttribute('for', el.id);

      // b. insert it
      if (el.nextElementSibling === null)
      {
        el.parentNode.appendChild(elErrorMsg);
      }
      else
      {
        el.parentNode.insertBefore(elErrorMsg, el.nextElementSibling);
      }
    }
  }

  /** - CONSTRUCTOR LOGIC - */
  (function init()
  {
    // 1. parse the error messages
    try
    {
      oErrorMsg = JSON.parse(el.getAttribute('data-messages'));
    }
    catch(oE)
    {
      return false;
    }

    // 2. grab hold of DOM
    elContainer = el.closest('.form__field');

    // 3. create DOM stuff
    createAdditionalDOM();

    // 4. bind to blur
    el.addEventListener('blur', () => fnValidate());
  }());


  return {
    validate: fnValidate
  };
}

function Validatable( elForm )
{
  let aoFields = [];

  /**
  * Constructor logic
  */
  (function init()
  {
    // hook into individual fields
    elForm.querySelectorAll('input[data-messages],select[data-messages],textarea[data-messages]').forEach(el =>
    {
      aoFields.push(new FormField(el));
    });

    // set novalidate
    elForm.setAttribute('novalidate', true);
  }());
}

module.exports = {
  name: 'validatable',
  init: Validatable
};
