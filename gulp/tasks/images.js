/*********************************************************************************************************************
 *
 * Image tasks.
 *
 *********************************************************************************************************************/

const gulp     = require( 'gulp' );
const plumber  = require( 'gulp-plumber' );
const imagemin = require( 'gulp-imagemin' );

// core stuff
const PATHS         = global.PATHS.images;
const OUTPUT        = global.PATHS.build;
const errorHandler  = global.errorHandler;

/**
 * Actual build task.
 */
gulp.task( 'images', () =>
{
  return  gulp.src( PATHS.source )
              .pipe( plumber({ errorHandler }))
              .pipe( imagemin() )
              .pipe( gulp.dest( OUTPUT ));
});

/** Expose things */
module.exports = {
  init: [ 'images' ],
  watch: {
    files: PATHS.watch,
    tasks: [ 'images' ]
  },
  build: [ 'images' ]
}
