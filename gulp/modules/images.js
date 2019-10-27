/*********************************************************************************************************************
 *
 * Image tasks.
 *
 *********************************************************************************************************************/

const { src, dest } = require( 'gulp' );
const imagemin      = require( 'gulp-imagemin' );

// core stuff
const { images: PATHS, build: OUTPUT } = require( '../paths' );
const { errorHandler } = require( '../utils/utils' );

/**
 * Actual build task.
 *
 * @return {Stream} a gulp stream
 */
const optimiseImages = () =>
  src( PATHS.source )
    .pipe( errorHandler() )
    .pipe( imagemin() )
    .pipe( dest( OUTPUT ));


/** Expose things */
module.exports = {
  init: [ optimiseImages ],
  watch: {
    files: PATHS.watch,
    tasks: [ optimiseImages ]
  },
  build: [ optimiseImages ]
}
