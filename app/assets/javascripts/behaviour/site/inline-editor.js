/*********************************************************************************************************************
*
*
*
*********************************************************************************************************************/

const loader = require( 'util/wysiwyg/instance/site-loader' );

module.exports = {
  name: 'inline-editor',
  init: ( elRoot, options ) =>
  {
    if (( options.property === undefined ) || ( options.uri === undefined ))
    {
      return;
    }

    loader().then( module => module.default( elRoot, options ));

    return {};
  }
};
