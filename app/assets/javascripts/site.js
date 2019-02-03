// Polyfill stuff for IE11
require( 'ext/polyfills' );

// include lazyload
require( 'util/lazyload' )();

// init behaviours
require( 'core/behaviours' ).init([
    require( 'behaviour/site/filters' ),
    require( 'behaviour/site/softtouch' ),
    require( 'behaviour/site/nav' ),
    require( 'behaviour/site/inline-editor' ),
    require( 'behaviour/site/page' )
]);
