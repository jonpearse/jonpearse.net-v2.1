/*********************************************************************************************************************
*
* SVG icon utility library.
*
*********************************************************************************************************************/

/**
* Creates an HTMLElement representing an SVG icon. This uses an SVG:USE element that points to a matching SYMBOL
* in an SVG spritesheet.
* For more information about this method, see https://css-tricks.com/svg-sprites-use-better-icon-fonts/
*
* Note that, as IE8 isn’t being bothered by JS, we’re not bothering to include any form of fallback.
*
* @param   {string} sIcon - the icon to embed
* @param   {Object} options - any additional options you wish to be passed to the icon
* @return  {HTMLElement} the icon as an HTMLElement
*/
function createIconDOM(sIcon, options = {})
{
  // 0. default the class
  options.class = options.class || '';

  // 1. create our SVG element
  let sNs   = 'http://www.w3.org/2000/svg';
  let elSvg = document.createElementNS(sNs, 'svg');
  elSvg.setAttributeNS(null, 'class', `svg-icon svg-icon--${sIcon} ${options.class}`);

  // 2. add the USE element
  let elUse = document.createElementNS(sNs, 'use');
  elUse.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#icon-' + sIcon);
  elSvg.appendChild(elUse);

  // 3. if we have a title
  if (options.title !== undefined)
  {
    // a. create a unique ID
    let sRandomId = Math.random().toString(36).substring(8, 4);
    sRandomId = `icon-${sIcon}_${sRandomId}-title`;

    // b. create the title
    let elTitle = document.createElementNS(sNs, 'title');
    elTitle.setAttribute('id', sRandomId);
    elTitle.appendChild(document.createTextNode(options.title));
    elSvg.appendChild(elTitle);

    // c. hook it up
    elSvg.setAttribute('aria-labelledby', sRandomId);
  }
  else
  {
    // we don’t so hide the icon from AT
    elSvg.setAttribute('aria-hidden', 'true');
  }

  return elSvg;
}

/**
* Similar to insertIcon above, but returns the SVG code as a string.
*
* @param   {string} sIcon - the icon to embed
* @param   {Object} options - any additional options you wish to be passed to the icon
* @return  {string} the SVG code for the required icon
*/
function createIconString(sIcon, options)
{
  let el = document.createElement('span');
  el.appendChild(createIconDOM(sIcon, options));

  return el.innerHTML;
}

module.exports = {
  icon: createIconDOM,
  string: createIconString
};
