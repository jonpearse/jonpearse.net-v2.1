const Lazyload = require( 'vendor/lazyload' );

module.exports = ( elRoot = document.body ) =>
{
    new Lazyload({
        container:     elRoot,
        class_initial: '-initial',
        class_loading: '-loading',
        class_loaded:  '-loaded',
        class_error:   '-failed',
        callback_error: el => el.removeAttribute( 'srcset' )
    });
}
