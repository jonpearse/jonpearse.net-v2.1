/*********************************************************************************************************************
 *
 * Metadata-related stuffs: mostly copying things around
 *
 *********************************************************************************************************************/

const { src, dest } = require( 'gulp' );
const babel         = require( 'gulp-babel' );
const uglify        = require( 'gulp-uglify' );
const replace       = require( 'gulp-replace' );
const imagemin      = require( 'gulp-imagemin' );

const { metadata: PATHS } = require( '../paths' );
const { errorHandler } = require( '../utils/utils' );

/**
 * Utility function to process the service worker.
 *
 * @param {String} sTok - the token to use when building the service worker.
 * @return {Stream} a gulp stream
 */
const serviceWorkerBase = sTok =>
  src( PATHS.sw )
    .pipe( babel({ presets: [ '@babel/env' ]}))
    .pipe( replace( '{{BUILD}}', sTok ));

/**
 * Copy task: stages metadata content to asset directory.
 *
 * @return {Stream} a gulp stream
 */
const copyMetadata = () =>
  src( PATHS.straightCopy )
    .pipe( errorHandler() )
    .pipe( dest( PATHS.output ));

/**
 * Process metadata images.
 *
 * @return {Stream} a gulp stream
 */
const metadataImages = () =>
  src( PATHS.images )
    .pipe( errorHandler() )
    .pipe( imagemin() )
    .pipe( dest( PATHS.output ));

/**
 * Compile service worker to development target.
 *
 * @return {Stream} a gulp stream
 */
const serviceWorkerDev = () => serviceWorkerBase( '_dev' ).pipe( dest( PATHS.output ));

/**
 * Compile service worker to production target.
 *
 * @return {Stream} a gulp stream
 */
const serviceWorkerBuild = () =>
{
  const sDateStamp = ( new Date().toISOString()).replace( /[^0-9T]/g, '' ).replace( /T(\d{4}).*$/, 'T$1' );
  return serviceWorkerBase( sDateStamp )
    .pipe( uglify() )
    .pipe( dest( PATHS.output ));
}

/**
 * Composite helper for dev.
 */
const metadataDev = [ copyMetadata, metadataImages, serviceWorkerDev ];

/* Expose ourselves */
module.exports = {
  init:  metadataDev,
  build: [ copyMetadata, metadataImages, serviceWorkerBuild ],
  watch: {
    files: [ PATHS.watch ],
    tasks: metadataDev
  },
  toClean: [ `${PATHS.output}/*.*` ]
}
