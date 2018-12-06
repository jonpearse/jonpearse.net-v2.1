// Polyfill stuff for IE11
require( 'ext/polyfills' );

// include lazyload
const Lazyload = require( 'vendor/lazyload' );
new Lazyload({
    class_initial: '-initial',
    class_loading: '-loading',
    class_loaded:  '-loaded',
    class_error:   '-failed',
    callback_error: el => el.removeAttribute( 'srcset' )
});

// init behaviours
