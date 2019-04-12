/*********************************************************************************************************************
*
* SVG Utilities
*
*********************************************************************************************************************/

const NAMESPACE = 'http://www.w3.org/2000/svg';

function element( sEl, attrs = {} )
{
  const elSvg = document.createElementNS( NAMESPACE, sEl );

  // bounce a class
  if ( attrs.class !== undefined )
  {
    elSvg.setAttributeNS( null, 'class', attrs.class );
    delete attrs.class;

  }

  // and everything else
  Object.keys( attrs ).forEach( k => elSvg.setAttribute( k, attrs[k] ));

  return elSvg;
}

function text( sContent, attrs = {} )
{
  const elText = element( 'text', attrs );
  elText.appendChild( document.createTextNode( sContent ));

  return elText;
}

function use( sHref )
{
  const elUse = document.createElementNS( NAMESPACE, 'use' );
  elUse.setAttributeNS( 'http://www.w3.org/1999/xlink', 'xlink-href', `#${sHref}` );

  return elUse;
}

module.exports = { element, use, text };
