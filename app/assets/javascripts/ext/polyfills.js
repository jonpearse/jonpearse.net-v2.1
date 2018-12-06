/*********************************************************************************************************************
 *
 * Polyfills for IE11
 *
 * It’d be nice not to bother, but it’s easy enough and this more-or-ess fixes everything.
 *
 *********************************************************************************************************************/


/* eslint-disable */
if (typeof Object.assign != 'function') {
  // Must be writable: true, enumerable: false, configurable: true
  Object.defineProperty(Object, "assign", {
    value: function assign(target, varArgs) { // .length of function is 2
      'use strict';
      if (target == null) { // TypeError if undefined or null
        throw new TypeError('Cannot convert undefined or null to object');
      }

      var to = Object(target);

      for (var index = 1; index < arguments.length; index++) {
        var nextSource = arguments[index];

        if (nextSource != null) { // Skip over if undefined or null
          for (var nextKey in nextSource) {
            // Avoid bugs when hasOwnProperty is shadowed
            if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
              to[nextKey] = nextSource[nextKey];
            }
          }
        }
      }
      return to;
    },
    writable: true,
    configurable: true
  });
}

if (typeof NodeList.prototype.forEach !== 'function')
{
    /**
     * Shims forEach into NodeList for browsers that don’t support it.
     *
     * @param   {function} fCallback - the function to call on each matched element in the NodeList
     */
    NodeList.prototype.forEach = function(fCallback)
    {
        for (let i = 0; i < this.length; i++)
        {
            fCallback(this.item(i), i, this);
        }
    }
}
