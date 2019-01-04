/*********************************************************************************************************************
 *
 * Custom button to do blockquotes better.
 *
 *********************************************************************************************************************/

const icon = require('util/icons').string;

/**
 * Returns an array containing all elements between the specified endpoints.
 *
 * @param {HTMLElement} elStart - the start element
 * @param {HTMLElement} elEnd - the ending element
 * @return {Array} all elements, including the start + end point
 */
function getElementRange(elStart, elEnd)
{
    let aRet = [];
    let elCurr = elStart;

    while (elCurr !== elEnd)
    {
        aRet.push(elCurr);
        elCurr = elCurr.nextElementSibling;
    }

    aRet.push(elEnd);
    return aRet;
}

/**
 * Creates + inserts a BLOCKQUOTE element from the given range.
 *
 * @param {HTMLElement} elStart - the start element
 * @param {HTMLElement} elEnd - the ending element
 * @param {Boolean} bInsert - true to insert the newly-created blockquote, false otherwise
 * @return {HTMLElement} the newly-created blockquote element
 */
function createBQFromRange(elStart, elEnd, bInsert = true)
{
    // 1. create the actual BLOCKQUOTE element + insert it in the DOM tree.
    let elBq = document.createElement('blockquote');
    if (bInsert)
    {
        elStart.parentNode.insertBefore(elBq, elStart);
    }

    // 2. now shunt everything into it
    getElementRange(elStart, elEnd).forEach(el =>
    {
        el.parentNode.removeChild(el);
        elBq.appendChild(el);
    });

    return elBq;
}

/**
 * Removes a blockquote and returns its former contents.
 *
 * @param {HTMLElement} elBq - the element to remove
 * @param {HTMLElement} elStart - the first element to remove (optional)
 * @param {HTMLElement} elEnd - the last element to remove (optional)
 * @return {Array} an array of removed elements
 */
function removeBlockquote(elBq, elStart = null, elEnd = null)
{
    // 1. normalise start + end, and get a range
    let aRange = getElementRange((elStart || elBq.firstElementChild), (elEnd || elBq.lastElementChild));

    // 2. remove elements in that range
    aRange.forEach(el => elBq.removeChild(el));

    return aRange;
}

/**
 *
 *
 * @return {Object} a public API
 */
function BQButton()
{
    let elButton;
    let elContentEditable;
    let oApi = null;

    /**
     * Utility function that returns the top-most block level tag that’s not a blockquote.
     *
     * @param {HTMLElement} el - the element for which we want to get things
     * @param {Boolean} bIncludeBq - whether or not we should go up to blockquote level
     * @return {HTMLElement} the top-most element
     */
    function getTopmostElement(el, bIncludeBq = false)
    {
        // 0. if it’s a text node, start off by going up…
        if (el.nodeType === Node.TEXT_NODE)
        {
            el = el.parentNode;
        }

        // 1. otherwise…
        while ((el.parentNode !== elContentEditable) && (el.parentNode.nodeName.toLowerCase() !== 'blockquote' || bIncludeBq))
        {
            el = el.parentNode;
        }

        return el;
    }

    /**
     * Toggles wrapping/unwrapping the start/finish elements in a blockquote.
     *
     * @param {HTMLElement} elStart - the start element
     * @param {HTMLElement} elEnd - the ending element
     */
    function toggleSingleParent(elStart, elEnd)
    {
        // 1. if we’re adding, this is relatively easy, so do so
        if (elStart.parentNode === elContentEditable)
        {
            createBQFromRange(elStart, elEnd);
            return;
        }

        // 2. removal gets more interesting: first, if the start + end are the first+last elements, just nuke the BQ
        let elBq = elStart.parentNode;
        if ((elBq.firstElementChild === elStart) && (elBq.lastElementChild === elEnd))
        {
            removeBlockquote(elBq).forEach(el => elBq.parentNode.insertBefore(el, elBq));
            elContentEditable.removeChild(elBq);
            return;
        }

        // 3. now it gets more fun: if it’s at the start of the blockquote…
        if (elBq.firstElementChild === elStart)
        {
            removeBlockquote(elBq, elStart, elEnd).forEach(el => elContentEditable.insertBefore(el, elBq));
            return;
        }

        // 4. if it’s at the end…
        if (elBq.lastElementChild === elEnd)
        {
            removeBlockquote(elBq, elStart, elEnd).forEach(el =>
            {
                if (elBq.nextSibling === null)
                {
                    elContentEditable.appendChild(el);
                }
                else
                {
                    elContentEditable.insertBefore(el, elBq.nextSibling);
                }
            });
        }

        // 5. we’re in the middle: this is more fun than it needs to be :/
        // a. remove preceding elements + wrap them in a new blockquote
        elContentEditable.inserBefore(createBQFromRange(elBq.firstElementChild, elStart.previousElementSibling, false), elBq);

        // b. remove our range + insert them
        removeBlockquote(elBq, elStart, elEnd).forEach(el => elContentEditable.insertBefore(el, elBq));
    }

    /**
     * Adds elements to an existing blockquote element.
     *
     * @param {HTMLElement} elStart - the start element
     * @param {HTMLElement} elEnd - the ending element
     */
    function extendExisting(elStart, elEnd)
    {
        // 1. if we’re extending the end…
        let elBq;
        if (elStart.parentNode.nodeName.toLowerCase() === 'blockquote')
        {
            elBq = elStart.parentNode;
            getElementRange(elBq.nextElementSibling, elEnd).forEach(el => elBq.appendChild(el));
            return;
        }

        // 2. otherwise, we’re extending at the front
        elBq = elEnd.parentNode;
        getElementRange(elStart, elBq.previousElementSibling).forEach(el => elBq.insertBefore(el, elBq.firstChild));
    }

    /**
     * Handles a user clicking on the button. This will have one of three effects:
     *
     * 1. if the selection is not in a blockquote, it’s wrapped in one
     * 2. if the selection both is and isn’t in a blockquote, anything outside will get shunted inside
     * 3. if the selection is in a blockquote, the blockquote is removed
     */
    function fnHandleClick()
    {
        // 1. get a selection, and ensure that it’s in a useful place
        let oSelection = window.getSelection();
        if (!elContentEditable.contains(oSelection.anchorNode))
        {
            return;
        }

        // 2. get some markers for the beginning + end nodes
        let elStart;
        let elEnd;
        if (oSelection.anchorNode.compareDocumentPosition(oSelection.focusNode) === Node.DOCUMENT_POSITION_FOLLOWING)
        {
            elStart = getTopmostElement(oSelection.anchorNode);
            elEnd   = getTopmostElement(oSelection.focusNode);
        }
        else
        {
            elStart = getTopmostElement(oSelection.focusNode);
            elEnd   = getTopmostElement(oSelection.anchorNode);
        }

        // 3. split based on ancestry
        if (elStart.parentNode === elEnd.parentNode)
        {
            toggleSingleParent(elStart, elEnd);
        }
        else
        {
            extendExisting(elStart, elEnd);
        }

        // 4. kick the editor
        oApi.base.checkContentChanged(elContentEditable);
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
        elButton.innerHTML = (oApi.base.options.buttonLabels === 'fontawesome' ? icon('quote-right') : '”');
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

module.exports = BQButton;
