/*********************************************************************************************************************
 *
 * Main JS file for the CMS.
 *
 *********************************************************************************************************************/

require( 'core/polyfills' );

require( 'core/behaviours' ).init([
    require( 'behaviour/admin/navigation' ),
    require( 'behaviour/admin/taggable' ),
    require( 'behaviour/admin/media-library' ),
    require( 'behaviour/admin/media-selector' ),
    require( 'behaviour/admin/content-selector' ),
    require( 'behaviour/common/validatable' ),
    require( 'behaviour/admin/wysiwyg' )
]);
