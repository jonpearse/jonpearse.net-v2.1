/*********************************************************************************************************************
 *
 * Metadata-related stuffs: mostly copying things around
 *
 *********************************************************************************************************************/

const gulp    = require( 'gulp' );
const plumber = require( 'gulp-plumber' );

// core stuff
const PATHS  = global.PATHS.metadata;
const OUTPUT = global.PATHS.build;
const { errorHandler } = require( '../utils/utils' );

/**
 * Copy task: copies metadata stuffs to the asset directory.
 */
gulp.task( 'copy-metadata', () =>
{
  return  gulp.src( PATHS.straightCopy )
              .pipe( plumber({ errorHandler }))
              .pipe( gulp.dest( OUTPUT ));
});


/* Expose ourselves */
module.exports = {
  init: [ 'copy-metadata' ],
  build: [ 'copy-metadata' ]
}
