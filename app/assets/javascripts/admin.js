/*********************************************************************************************************************
 *
 * Main JS file for the CMS.
 *
 *********************************************************************************************************************/

require( 'core/polyfills' );

require( 'core/behaviours' ).init([
    require( 'behaviour/admin/navigation' ),
    require( 'behaviour/admin/taggable' )
]);
